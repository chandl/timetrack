import { Request, Response } from "express";
import { Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { connection } from "../connection/Connection";
import { ReportStatus } from "../dto/ReportDto";
import { ReportRequest } from "../dto/ReportRequest";
import { ReportResponse } from "../dto/ReportResponse";
import { Report } from "../entity/Report";
import { Time } from "../entity/Time";
import { Mapper } from "../mapper/Mapper";

// TODO CREATE ReportService and TimeService to hold methods to connect to db

const mapper = new Mapper();
class ReportController {
  constructor() {}

  public newReport(req: Request, res: Response) {
    const request: ReportRequest = req.body;
    const report = mapper.mapReport(request);
    report.status = ReportStatus.INITIALIZED;

    // create filter to find times between two dates
    const filter: { [key: string]: any } = {};
    filter.day = Between(request.startDate, request.endDate);

    connection
      .then(async (conn) => {
        // CHECK FOR REPORT OVERLAPS
        // (StartA <= EndB) and (EndA >= StartB)
        const reportFilter: { [key: string]: any } = {};
        reportFilter.endDate = MoreThanOrEqual(request.startDate);
        reportFilter.startDate = LessThanOrEqual(request.endDate);
        const overlappingReports = await conn.manager.find(
          Report,
          reportFilter
        );

        if (overlappingReports.length > 0) {
          res
            .status(409)
            .json({
              message: "overlapping reports found. choose another time range",
              overlappingReports,
            });
          return;
        }

        // Find times
        const timesFromDb: Time[] = await conn.manager.find(Time, filter);

        // create the report or throw if no times found
        if (timesFromDb.length > 0) {
          await conn.manager
            .save(report)
            .then((entity) => (report.id = entity.id));
        } else {
          res.status(404).json({
            message: "No tracked time found in the requested timeframe",
          });
          return;
        }

        // Update the associated report for each time
        timesFromDb.forEach(async (time) => {
          time.associatedReport = report;
          await conn.manager.save(time);
        });

        res
          .status(200)
          .json(new ReportResponse(mapper.mapReportToDto(report), sortTimesByCustomer(timesFromDb)));
      })
      .catch((err) => {
        console.error("Error creating new report", err);
        res.status(500).json(err);
      });
  }

  public getReportById(req: Request, res: Response) {
    connection
      .then(async (conn) => {
        const existingReport = await conn.manager.findOne(
          Report,
          req.params.id
        );
        if (!existingReport) {
          res.status(404).send();
          return;
        }

        const times = await conn.manager.find(Time, {
          associatedReport: existingReport,
        });

        res
          .status(200)
          .json(new ReportResponse(mapper.mapReportToDto(existingReport), sortTimesByCustomer(times)));
      })
      .catch((err) => {
        console.error("Error getting report by ID", err);
        res.status(500).json(err);
      });
  }

  public getReports(req: Request, res: Response) {
    // TODO filter strings
    connection
      .then(async (conn) => {
        const reports = await conn.manager.find(Report);
        res.status(200).json(reports.map(rep => mapper.mapReportToDto(rep)));
      })
      .catch((err) => {
        console.error("Error getting reports", err);
        res.status(500).json(err);
      });
  }

  public deleteReport(req: Request, res: Response) {
    console.log("Deleting report with id", req.params.id);
    connection
      .then(async (conn) => {
        conn.manager.delete(Report, req.params.id).then((deleteResult) => {
          if (deleteResult.affected > 0) {
            res.status(200).send();
          } else {
            res.status(404).send();
          }
        });
      })
      .catch((err) => {
        console.log("Error deleting report", err);
        res.status(500).json(err);
      });
  }

  public updateReport(req: Request, res: Response) {
    res.status(501).json({ message: "update not implemented" });
  }
}

export { ReportController };

const getNumberOfWeekdays = (startDate: Date, endDate: Date): number => {
  let numWorkDays = 0;
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    // Skips Sunday and Saturday
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      numWorkDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return numWorkDays;
};

const sortTimesByCustomer = (times: Time[]): Map<string, any> => {
  // Map the data to response
  let customers: Map<string, any> = new Map();
  times.forEach((t) => {
    // clone to prevent report from being overwritten
    const time = Object.assign({}, t);
    delete time.associatedReport;
    customers[time.customer.toLowerCase()] =
      customers[time.customer.toLowerCase()] || [];
    customers[time.customer.toLowerCase()].push(time);
  });

  return customers;
};

const calculateTotalTime = (times: Time[]): number => {
  return times.map((time) => time.minutes).reduce((a, b) => a + b);
};
