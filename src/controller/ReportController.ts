import { Request, Response } from "express";
import { Between } from "typeorm";
import { connection } from "../connection/Connection";
import { ReportRequest } from "../dto/ReportRequest";
import { Report } from "../entity/Report";
import { Time } from "../entity/Time";
import { Mapper } from "../mapper/Mapper";

const mapper = new Mapper();
class ReportController {
  constructor() {}

  public newReport(req: Request, res: Response) {
    const request: ReportRequest = req.body;
    const report = mapper.mapReport(request);

    // create filter to find times between two dates
    const filter: { [key: string]: any } = {};
    filter.day = Between(request.startDate, request.endDate);

    connection
      .then(async (conn) => {
        // TODO CHECK FOR REPORT OVERLAPS

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

        // TODO prevent each time object from showing reference to report
        res.status(200).json({
          report: report,
          times: sortTimesByCustomer(timesFromDb),
        });
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

        const response = {
          report: existingReport,
          times: sortTimesByCustomer(times),
        };

        res.status(200).json(response);
      })
      .catch((err) => {
        console.error("Error getting report by ID", err);
        res.status(500).json(err);
      });
  }

  public getReports(req: Request, res: Response) {}

  public deleteReport(req: Request, res: Response) {}

  public updateReport(req: Request, res: Response) {}
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
    customers[time.customer.toLowerCase()] = customers[time.customer.toLowerCase()] || [];
    customers[time.customer.toLowerCase()].push(time);
  });

  return customers;
};
