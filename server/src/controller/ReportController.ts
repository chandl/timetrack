import { Request, Response } from "express";
import { Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { connection } from "../connection/Connection";
import { ReportStatus } from "../dto/ReportDto";
import { ReportRequest } from "../dto/ReportRequest";
import { Report } from "../entity/Report";
import { Time } from "../entity/Time";
import { Mapper } from "../mapper/Mapper";
import ReportService from "../service/ReportService";
import TimeService from "../service/TimeService";

// TODO CREATE ReportService and TimeService to hold methods to connect to db

const mapper = new Mapper();
class ReportController {
  private reportService: ReportService;
  private timeService: TimeService;

  constructor({ reportService, timeService }) {
    this.reportService = reportService;
    this.timeService = timeService;
  }

  public newReport = (req: Request, res: Response) => {
    const request: ReportRequest = req.body;
    this.reportService
      .createReport(request, this.timeService)
      .then((reportDto) => res.status(200).json(reportDto))
      .catch((err) => {
        console.error("Error creating new report", err);
        res.status(err.code).json(err);
      });
  };

  public getReportById = (req: Request, res: Response) => {
    console.info("Getting report for id=", req.params.id);
    this.reportService
      .getReportById(req.params.id, this.timeService)
      .then((reportDto) => res.status(200).json(reportDto))
      .catch((err) => {
        console.error("Error getting report by id", err);
        res.status(err.code).json(err);
      });
  };

  public getReports = (req: Request, res: Response) => {
    this.reportService
      .getReportsByFilter({})
      .then((reportDtos) => res.status(200).json(reportDtos))
      .catch((err) => {
        console.error("Error getting all reports", err);
        res.status(err.code).json(err);
      });
  };

  public deleteReport = (req: Request, res: Response) => {
    console.info("Deleting report with id", req.params.id);

    this.reportService
      .deleteReport(req.params.id)
      .then(() => res.status(200).send())
      .catch((err) => {
        console.error("Error deleting report", err);
        res.status(err.code).json(err);
      });
  };

  public updateReport(req: Request, res: Response) {
    res.status(501).json({ message: "update not implemented" });
  }
}

export { ReportController };
