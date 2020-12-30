import { TimeDto } from "../dto/TimeDto";
import { Time } from "../entity/Time";
import { connection } from "../connection/Connection";
import { Mapper } from "../mapper/Mapper";
import ServiceError from "../error/ServiceError";
import { Between, In, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

export default class TimeService {
  private mapper: Mapper;
  constructor() {
    this.mapper = new Mapper();
  }

  public getById = async (timeId: string): Promise<TimeDto | ServiceError> => {
    return connection.then(async (conn) => {
      const existingTime = await conn.manager.findOne(Time, timeId);
      if (!existingTime) {
        return Promise.reject(
          new ServiceError({
            code: 404,
            message: "Time not found",
          })
        );
      }

      return Promise.resolve(this.mapper.mapToDto(existingTime));
    });
  };

  public getTimesByFilter = async ({
    startDate,
    endDate,
    customer,
  }): Promise<TimeDto[] | ServiceError> => {
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
    filter.active = true;

    console.log("Getting all times with filter", filter);

    return connection
      .then(async (conn) => {
        const times: Time[] = await conn.manager.find(Time, filter);
        return Promise.resolve(times.map((t) => this.mapper.mapToDto(t)));
      })
      .catch((err) =>
        Promise.reject({ code: 500, message: JSON.stringify(err) })
      );
  };

  public addTime = async (
    timeRequest: Time
  ): Promise<TimeDto | ServiceError> => {
    return connection
      .then(async (conn) => {
        return conn.manager
          .save(timeRequest)
          .then((entity) => Promise.resolve(this.mapper.mapToDto(entity)));
      })
      .catch((err) =>
        Promise.reject(
          new ServiceError({
            code: 500,
            message: "Error adding time " + JSON.stringify(err),
          })
        )
      );
  };

  public updateTime = async (
    timeId: string,
    timeBody: any
  ): Promise<TimeDto | ServiceError> => {
    return connection
      .then(async (conn) => {
        const existingTime = await conn.manager.findOne(Time, timeId);
        if (!existingTime) {
          return Promise.reject(
            new ServiceError({ code: 404, message: "Time not found" })
          );
        }

        const updatedTime = this.mapper.mapTime(timeBody, existingTime);

        return conn.manager
          .save(updatedTime)
          .then((entity) => Promise.resolve(this.mapper.mapToDto(entity)));
      })
      .catch((err) =>
        err instanceof ServiceError
          ? Promise.reject(err)
          : Promise.reject(
              new ServiceError({ code: 500, message: JSON.stringify(err) })
            )
      );
  };

  public deleteTime = async (timeId: string): Promise<void | ServiceError> => {
    // SOFT DELETE - set active=false
    return connection
      .then(async (conn) => {
        const existingTime = await conn.manager.findOne(Time, timeId);
        if (!existingTime) {
          return Promise.reject(
            new ServiceError({ code: 404, message: "Time not found" })
          );
        }

        existingTime.active = false;
        existingTime.associatedReportId = null;

        return conn.manager
          .save(existingTime)
          .then((entity) => Promise.resolve());
      })
      .catch((err) =>
        err instanceof ServiceError
          ? Promise.reject(err)
          : Promise.reject(
              new ServiceError({ code: 500, message: JSON.stringify(err) })
            )
      );

    // HARD DELETE
    /*connection
      .then(async (conn) => {
        conn.manager.delete(Time, timeId).then((deleteResult) => {
          if (deleteResult.affected > 0) {
            return Promise.resolve();
          } else {
              return Promise.reject(new ServiceError({code: 404, message: "Time not found"}))
          }
        });
      })
      .catch((err) => Promise.reject(new ServiceError({code: 500, message: err})));*/
  };

  public mergeTimes = async (
    timeIdsToMerge: number[]
  ): Promise<TimeDto | ServiceError> => {
    if (!timeIdsToMerge || timeIdsToMerge.length == 0) {
      return Promise.reject(
        new ServiceError({
          code: 400,
          message:
            "Two or more time IDs in 'toMerge' list in request body are requred to merge",
        })
      );
    }

    const mergeSet = new Set(timeIdsToMerge);

    return connection
      .then(async (conn) => {
        const times = await conn.manager.find(Time, {
          id: In(Array.from(mergeSet)),
        });

        if (times.length != mergeSet.size) {
          return Promise.reject(
            new ServiceError({
              code: 400,
              message: "Could not find all requested entries",
            })
          );
        }
        validateMergeTimes(times);
        // set all old times to inactive
        times.forEach((t) => {
          t.active = false;
          conn.manager.save(t);
        });
        const merged = await this.doMergeTimes(times);

        return conn.manager
          .save(merged)
          .then((entity) => Promise.resolve(this.mapper.mapToDto(entity)));
      })
      .catch((err) =>
        err instanceof ServiceError
          ? Promise.reject(err)
          : Promise.reject(
              new ServiceError({ code: 500, message: JSON.stringify(err) })
            )
      );
  };

  private doMergeTimes = (times: Time[]): Promise<Time> => {
    // Make a clone of the first time
    const mergedTime: Time = this.mapper.mapTime(times[0]);
    if (times[0].associatedReportId)
      mergedTime.associatedReportId = times[0].associatedReportId;
    mergedTime.notes = `${mergedTime.notes} (${mergedTime.minutes} min)`;

    let curr: Time;
    for (let i = 1; i < times.length; i++) {
      curr = times[i];
      mergedTime.minutes += curr.minutes;
      mergedTime.notes += `\n${curr.notes} (${curr.minutes} min)`;
    }

    return Promise.resolve(mergedTime);
  };
}

const validateMergeTimes = (timesToMerge: Time[]): Promise<Time[]> => {
  const expectedCustomer = timesToMerge[0].customer;
  const expectedServiceItem = timesToMerge[0].serviceItem;
  const expectedBillable = timesToMerge[0].billable;
  const expectedReport = timesToMerge[0].associatedReportId;

  const validMergeTimes = timesToMerge.filter(
    (time) =>
      time.customer.toUpperCase() === expectedCustomer.toUpperCase() &&
      time.serviceItem.toUpperCase() === expectedServiceItem.toUpperCase() &&
      time.billable === expectedBillable &&
      time.associatedReportId === expectedReport
  );

  if (validMergeTimes.length != timesToMerge.length) {
    return Promise.reject({
      message:
        "Could not merge entries: customer, serviceItem, report, and billable must be the same",
      invalid: timesToMerge
        .filter((time) => !validMergeTimes.includes(time))
        .map((t) => t.id),
      expected: {
        customer: expectedCustomer,
        serviceItem: expectedServiceItem,
        billable: expectedBillable,
        associatedReport: expectedReport,
      },
    });
  }
  return Promise.resolve(timesToMerge);
};
