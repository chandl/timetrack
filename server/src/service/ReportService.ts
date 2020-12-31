import { ReportDto, ReportStatus } from "../dto/ReportDto";
import ServiceError from "../error/ServiceError";
import { connection } from "../connection/Connection";
import { Report } from "../entity/Report";
import { getDayFromDate, Mapper } from "../mapper/Mapper";
import { ReportRequest } from "../dto/ReportRequest";
import TimeService from "./TimeService";
import { Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import ReportGenerator from "./ReportGeneratorService";

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

        if (generatedFile) {
          existingReport.generatedFile = generatedFile;
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
  ): Promise<ReportDto | ServiceError> => {
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
      const day = getDayFromDate(hasDate);
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
    reportGenerator: ReportGenerator
  ) => {
    await this.updateReport({
      reportId: reportId,
      status: ReportStatus.GENERATING,
    })
      .then((report) => reportGenerator.generateReport(report))
      .then((generatedFile) =>
        this.updateReport({
          reportId: reportId,
          status: ReportStatus.COMPLETED,
          generatedFile: generatedFile,
        })
      );
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
