import { Request, Response } from "express";
import { Between, In, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
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
        res.status(200).json(mapper.mapToDto(existingTime));
      })
      .catch((err) => {
        console.error("Error getting time by id", err);
        res.status(500).json(err);
      });
  }

  public getTimes(req: Request, res: Response) {
    // Possible Query Parameters for Filtering
    // Sorting can be done on the frontend
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const customer = req.query.customer;

    const filter: { [key: string]: any } = {};
    if (startDate && endDate) {
      filter.day = Between(startDate, endDate);
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

        res.json(times.map(time => mapper.mapToDto(time)));
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
          res.status(200).json(mapper.mapToDto(entity));
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
          res.status(200).json(mapper.mapToDto(entity));
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

  public mergeTime(req: Request, res: Response) {
    // request body:
    //   {
    //       "toMerge": [id1, id2, id3, etc...]
    //   }

    // times must have * same customer, same serviceItem, same billable

    const mergeList: number[] = req.body.toMerge;

    if (!mergeList || mergeList.length == 0) {
      res.status(400).json({
        error: "non-empty toMerge list required in request body",
      });
      return;
    }

    const mergeSet = new Set(mergeList);
    console.log("Merging times", mergeSet);

    const mergedTime = new Time();

    connection
      .then(async (conn) => {
        await conn.manager
          .find(Time, {
            id: In(Array.from(mergeSet)),
          })
          .then((times) => {
            if (times.length != mergeSet.size) {
              console.error(
                "Could not find all expected merge entries",
                mergeSet,
                " - found",
                times.map((time) => time.id)
              );
              res.status(400).json("Could not find all requested entries");
              return;
            }
            return times;
          })
          .then((times) => validateMergeTimes(times))
          .then((times) => mergeTimes(times))
          .then((time) => {
            console.log("Successfully merged times", time);
            res.json(mapper.mapToDto(time));
          })
          //todo merge
          .catch((err) => res.status(400).json(err));
      })
      .catch((err) => {
        console.error("Error merging", err);
        res.status(500).json(err);
      });
  }
}
export { TimeController };

const validateMergeTimes = (timesToMerge: Time[]): Promise<Time[]> => {
  console.log("validating");
  const expectedCustomer = timesToMerge[0].customer;
  const expectedServiceItem = timesToMerge[0].serviceItem;
  const expectedBillable = timesToMerge[0].billable;

  const validMergeTimes = timesToMerge.filter(
    (time) =>
      time.customer === expectedCustomer &&
      time.serviceItem === expectedServiceItem &&
      time.billable === expectedBillable
  );

  console.log("hello");

  if (validMergeTimes.length != timesToMerge.length) {
    console.log(
      "Could not merge entries: customer, serviceItem, and billable must be the same"
    );
    return Promise.reject({
      message:
        "Could not merge entries: customer, serviceItem, and billable must be the same",
      invalid: timesToMerge.filter((time) => !validMergeTimes.includes(time)),
      expected: {
        customer: expectedCustomer,
        serviceItem: expectedServiceItem,
        billable: expectedBillable,
      },
    });
  }
  return Promise.resolve(timesToMerge);
};

const mergeTimes = (times: Time[]): Promise<Time> => {
  // Make a clone of the first time
  const mergedTime = mapper.mapTime(times[0]);
  mergedTime.notes += ` (${mergedTime.minutes} min)`;

  let curr: Time;
  for (let i = 1; i < times.length; i++) {
    curr = times[i];
    mergedTime.minutes += curr.minutes;
    mergedTime.notes += `\n${curr.notes} (${curr.minutes} min)`;
  }

  return Promise.resolve(mergedTime);
};
