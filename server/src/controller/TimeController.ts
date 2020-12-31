import { Request, Response } from "express";
import { Mapper } from "../mapper/Mapper";

import TimeService from "../service/TimeService";
import ReportService from "../service/ReportService";

const mapper = new Mapper();
class TimeController {
  private timeService: TimeService;
  private reportService: ReportService;

  constructor({ timeService, reportService }) {
    this.timeService = timeService;
    this.reportService = reportService;
  }

  public getTimeById = (req: Request, res: Response) => {
    console.info("Getting time with id=", req.params.id);
    this.timeService
      .getById(req.params.id)
      .then((timeDto) => res.status(200).json(timeDto))
      .catch((err) => {
        console.error("Error retrieving time", err);
        res.status(err.code).json(err);
      });
  };

  public getTimes = (req: Request, res: Response) => {
    this.timeService
      .getTimesByFilter({
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        customer: req.query.customer,
      })
      .then((timeDtos) => res.status(200).json(timeDtos))
      .catch((err) => {
        console.error("Error retrieving all times", err);
        res.status(err.code).json(err);
      });
  };

  public addTime = (req: Request, res: Response) => {
    const time = mapper.mapTime(req.body);
    console.info(`Adding new time=${JSON.stringify(time)}`);
    this.timeService
      .addTime(time, this.reportService)
      .then((savedTime) => res.status(200).json(savedTime))
      .catch((err) => {
        console.error("Failed to add new time", err);
        res.status(err.code).json(err);
      });
  };

  public updateTime = (req: Request, res: Response) => {
    console.info(
      `Updating time with id=${req.params.id};  new=${JSON.stringify(req.body)}`
    );

    this.timeService
      .updateTime(req.params.id, req.body)
      .then((updatedTime) => res.status(200).json(updatedTime))
      .catch((err) => {
        console.error("Failed to update time", err);
        res.status(err.code).json(err);
      });
  };

  public deleteTime = (req: Request, res: Response) => {
    console.info("Deleting time with id=", req.params.id);
    this.timeService
      .deleteTime(req.params.id)
      .then(() => res.status(200).send())
      .catch((err) => {
        console.error("Error deleting time", err);
        res.status(err.code).json(err);
      });
  };

  /*
   * request body:
   *   {
   *       "toMerge": [id1, id2, id3, etc...]
   *   }
   */
  public mergeTime = (req: Request, res: Response) => {
    console.info("Merging times with ids=", req.body.toMerge);
    this.timeService
      .mergeTimes(req.body.toMerge)
      .then((mergedTime) => res.status(200).json(mergedTime))
      .catch((err) => {
        console.error("Error merging times", err);
        res.status(err.code).json(err);
      });
  };
}
export { TimeController };
