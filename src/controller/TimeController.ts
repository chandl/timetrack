import { Request, Response } from "express";
import { Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { connection } from "../connection/Connection";
import { Time } from "../entity/Time";
import { Mapper } from "../mapper/Mapper";

const mapper = new Mapper();
class TimeController {
  constructor() {}

  public getTimeById(req: Request, res: Response) {
    connection
      .then(async (conn) => {
        const existingTime = await conn.manager.findOne(Time, req.params.id);
        if (!existingTime) {
          res.status(404).send();
          return;
        }
        res.status(200).json(existingTime);
      })
      .catch((err) => {
        console.error("Error getting time by id", err);
        res.status(500).json(err);
      });
  }

  // todo merge times endpoint

  public getAllTimes(req: Request, res: Response) {
    // Possible Query Parameters for Filtering
    // Sorting can be done on the frontend
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const customer = req.query.customer;

    const filter: {[key: string]: any} = {};
    if (startDate && endDate) {
        filter.day = Between(startDate, endDate)
    } else if (startDate) {
        filter.day = MoreThanOrEqual(startDate);
    } else if (endDate) {
        filter.day = LessThanOrEqual(endDate);
    }
    if (customer) {
        filter.customer = customer;
    }
    console.log("Getting all times with filter", filter);

    // SEARCH DATABASE
    connection
      .then(async (conn) => {
        const times: Time[] = await conn.manager.find(Time, filter);

        res.json(times);
      })
      .catch((err) => {
        console.error("Error getting all times", err);
        res.status(500).json(err);
      });
  }

  public addTime(req: Request, res: Response) {
    const time = mapper.mapTime(req.body);
    connection
      .then(async (conn) => {
        console.log("Adding time:", time);
        conn.manager.save(time).then((entity) => {
          res.status(200).json(entity);
        });
      })
      .catch((err) => {
        console.error("Error adding time", err);
        res.status(500).json(err);
      });
  }

  public updateTime(req: Request, res: Response) {
    connection
      .then(async (conn) => {
        const existingTime = await conn.manager.findOne(Time, req.params.id);
        if (!existingTime) {
          res.status(404).send();
          return;
        }
        console.log("Updating time; existing", existingTime);
        const updatedTime = mapper.mapTime(req.body, existingTime);

        conn.manager.save(updatedTime).then((entity) => {
          console.log("Time updated successfully; updated", entity);
          res.status(200).json(entity);
        });
      })
      .catch((err) => {
        console.error("Error updating time", err);
        res.status(500).json(err);
      });
  }

  public deleteTime(req: Request, res: Response) {
    console.log("Deleting time with id", req.params.id);
    connection
      .then(async (conn) => {
        conn.manager.delete(Time, req.params.id).then((deleteResult) => {
          if (deleteResult.affected > 0) {
            res.status(200).send();
          } else {
            res.status(404).send();
          }
        });
      })
      .catch((err) => {
        console.log("Error deleting time", err);
        res.status(500).json(err);
      });
  }
}
export { TimeController };
