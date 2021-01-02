import { ReportDto, ReportStatus } from "../dto/ReportDto";
import ServiceError from "../error/ServiceError";
import { connection } from "../connection/Connection";
import { Report } from "../entity/Report";
import { getDayFromDate, Mapper } from "../mapper/Mapper";
import { ReportRequest } from "../dto/ReportRequest";
import TimeService from "./TimeService";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { writeFile, readFileSync } from "fs";
import { TimeDto } from "../dto/TimeDto";

const REPORT_DIR = `${process.env.DIR}/reports`;
const HOST = process.env.HOSTNAME || "localhost:3000";

const REPORT_TEMPLATE = readFileSync(`${REPORT_DIR}/tracktime-template.py`);
const PLACEHOLDER = "!!ENCODED_DATA_PLACEHOLDER!!";

const handleErr = (err) =>
  err instanceof ServiceError
    ? Promise.reject(err)
    : Promise.reject(
        new ServiceError({ code: 500, message: JSON.stringify(err) })
      );

export default class ReportService {
  private mapper: Mapper;
  constructor() {
    this.mapper = new Mapper();
  }
  public createReport = async (
    reportRequest: ReportRequest,
    timeService: TimeService
  ): Promise<ReportDto | ServiceError> => {
    const report = this.mapper.mapReport(reportRequest);
    report.status = ReportStatus.IN_PROGRESS;

    return connection
      .then(async (conn) => {
        // CHECK FOR REPORT OVERLAPS
        // (StartA <= EndB) and (EndA >= StartB)
        const reportFilter: { [key: string]: any } = {};
        reportFilter.endDate = MoreThanOrEqual(reportRequest.startDate);
        reportFilter.startDate = LessThanOrEqual(reportRequest.endDate);
        const overlappingReports = await conn.manager.find(
          Report,
          reportFilter
        );

        if (overlappingReports.length > 0) {
          return Promise.reject(
            new ServiceError({
              code: 409,
              message:
                "overlapping reports found. choose another time range. conflicting report ids=" +
                JSON.stringify(overlappingReports.map((rep) => rep.id)),
            })
          );
        }

        // Find times in requested range
        const timesInDateRange = await timeService.getTimesByFilter({
          startDate: reportRequest.startDate,
          endDate: reportRequest.endDate,
        });
        if (timesInDateRange.length > 0) {
          await conn.manager
            .save(report)
            .then((entity) => (report.id = entity.id));
        } else {
          return Promise.reject(
            new ServiceError({
              code: 404,
              message: "No tracked time found in the requested timeframe",
            })
          );
        }

        timesInDateRange.forEach(async (time) => {
          time.associatedReportId = report.id;
          await timeService.updateTime(`${time.id}`, time);
        });

        return Promise.resolve(
          this.mapper.mapReportDetail(report, timesInDateRange)
        );
      })
      .catch((err) => handleErr(err));
  };

  public updateReport = async (
    updateParams: UpdateReportParams
  ): Promise<ReportDto> => {
    const { reportId, status, generatedFile } = { ...updateParams };

    return connection
      .then(async (conn) => {
        const existingReport = await conn.manager.findOne(Report, reportId);
        if (!existingReport) {
          return Promise.reject(
            new ServiceError({ code: 404, message: "Report not found" })
          );
        }

        if (status) {
          existingReport.status = status;
        }

        if (generatedFile != null) {
          existingReport.generatedFile =
            generatedFile === "" ? null : generatedFile;
        }

        return conn.manager
          .save(existingReport)
          .then((entity) =>
            Promise.resolve(this.mapper.mapReportToDto(entity))
          );
      })
      .catch((err) => handleErr(err));
  };

  public getReportById = async (
    reportId: string,
    timeService: TimeService
  ): Promise<ReportDto> => {
    return connection
      .then(async (conn) => {
        const existingReport = await conn.manager.findOne(Report, reportId);
        if (!existingReport) {
          return Promise.reject(
            new ServiceError({ code: 404, message: "Report not found" })
          );
        }
        const associatedTimes = await timeService.getTimesByFilter({
          associatedReportId: existingReport.id,
        });
        return Promise.resolve(
          this.mapper.mapReportDetail(existingReport, associatedTimes)
        );
      })
      .catch((err) => handleErr(err));
  };

  public getReportsByFilter = async (
    reportFilter: ReportFilter
  ): Promise<ReportDto[]> => {
    const { hasDate } = { ...reportFilter };

    const filter: { [key: string]: any } = {};
    if (hasDate) {
      const day = getDayFromDate(new Date(hasDate));
      filter.startDate = LessThanOrEqual(day);
      filter.endDate = MoreThanOrEqual(day);
    }

    console.info("Getting reports with filter", filter);

    return connection.then(async (conn) =>
      conn.manager
        .find(Report, filter)
        .then((reps) =>
          Promise.resolve(reps.map((rep) => this.mapper.mapReportToDto(rep)))
        )
        .catch((err) =>
          Promise.reject(
            new ServiceError({ code: 500, message: JSON.stringify(err) })
          )
        )
    );
  };

  public deleteReport = async (
    reportId: string
  ): Promise<void | ServiceError> => {
    return connection
      .then(async (conn) => {
        conn.manager.delete(Report, reportId).then((deleteResult) => {
          if (deleteResult.affected > 0) {
            return Promise.resolve();
          } else {
            return Promise.reject(
              new ServiceError({ code: 404, message: "Report not found" })
            );
          }
        });
      })
      .catch((err) => handleErr(err));
  };

  public finalizeReport = async (
    reportId: string,
    timeService: TimeService
  ) => {
    await this.updateReport({
      reportId: reportId,
      status: ReportStatus.GENERATING,
    })
      .then(async (report) => {
        // finalize times
        const times = await timeService
          .getTimesByFilter({ associatedReportId: reportId })
          .then((associatedTimes) => {
            associatedTimes.forEach((time) =>
              timeService.finalizeTime(time.id, true)
            );
            return associatedTimes;
          });
        return {
          report: report,
          times: times,
        };
      })
      .then(({ report, times }) => this.generateReport(report, times))
      .then((generatedFile) =>
        this.updateReport({
          reportId: reportId,
          status: ReportStatus.COMPLETED,
          generatedFile: generatedFile,
        })
      )
      .catch((err) => {
        console.error("Error finalizing report - reverting", err);
        this.unfinalizeReport(reportId, timeService);
      });
  };

  public unfinalizeReport = async (
    reportId: string,
    timeService: TimeService
  ): Promise<void> => {
    const reversableStatuses = [
      ReportStatus.GENERATING,
      ReportStatus.COMPLETED,
    ];
    return this.getReportById(reportId, timeService)
      .then((report) => {
        if (!reversableStatuses.includes(report.status)) {
          return Promise.reject(
            new ServiceError({
              code: 409,
              message: "Report is not in a reversable state.",
            })
          );
        }
      })
      .then(() =>
        this.updateReport({
          reportId: reportId,
          status: ReportStatus.IN_PROGRESS,
          generatedFile: "",
        })
      )
      .then(() => {
        // finalize times
        timeService
          .getTimesByFilter({ associatedReportId: reportId, finalized: true })
          .then((associatedTimes) =>
            associatedTimes.forEach((time) => {
              timeService.finalizeTime(time.id, false);
            })
          );
      })
      .catch((err) => handleErr(err));
  };

  private generateReport = async (
    report: ReportDto,
    times: TimeDto[]
  ): Promise<string> => {
    console.log("Generating Report Script for reportId", report.id);

    const reportDetail = this.mapper.mapReportDetail(report, times);

    // flatten times
    const reportTimes = [];
    reportDetail.details.forEach((det) =>
      det.formatted.forEach((fmt) =>
        fmt.times.forEach((time) => {
          if(time.minutes > 0) reportTimes.push(time)
        })
      )
    );

    const reportFile = {
      report: {
        startDate: reportDetail.startDate,
        endDate: reportDetail.endDate,
      },
      times: reportTimes,
    };

    const body = REPORT_TEMPLATE.toString().replace(
      PLACEHOLDER,
      Buffer.from(JSON.stringify(reportFile)).toString("base64")
    );

    const fileName = `report-${report.startDate}-to-${report.endDate}.py`;
    const filePath = `${REPORT_DIR}/${fileName}`;

    console.log("Writing report to", filePath);
    writeFile(filePath, body, () => {});
    return Promise.resolve(`https://${HOST}/reports/${fileName}`);
  };
}

interface ReportFilter {
  hasDate?: any; //represents a date that is >=startDate and <=endDate of a report
}

interface UpdateReportParams {
  reportId: any;
  status?: string;
  generatedFile?: string;
}
