import { Request, Response } from "express";
import { Between } from "typeorm";
import { connection } from "../connection/Connection";
import { ReportRequest } from "../dto/ReportRequest";
import { ReportResponse, CustomerResponse } from "../dto/ReportResponse";
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
          res
            .status(404)
            .json({
              message: "No tracked time found in the requested timeframe",
            });
          return;
        }

        // Map the data to response
        let customers: Map<string, CustomerResponse> = new Map();
        timesFromDb.forEach((time) => {
          customers[time.customer.toLowerCase()] = customers[
            time.customer.toLowerCase()
          ] || {
            customer: time.customer,
            timeTracked: [],
          };
          customers[time.customer.toLowerCase()]["timeTracked"].push(time);

          time.associatedReport = report;
          conn.manager.save(time);
        });

        // TODO prevent each time object from showing reference to report
        res.json(Object.assign({}, { report: report }, { times: customers }));
      })
      .catch((err) => {
        console.error("Error getting all times", err);
        res.status(500).json(err);
      });

    // Return these times to the user, sorted by customer

    // one time -> one report
    // one report -> many times
  }

  public getReportById(req: Request, res: Response) {}

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
