import { TimeDto } from "../dto/TimeDto";
import { Time } from "../entity/Time";
import { connection } from "../connection/Connection";
import { getDayFromDate, Mapper } from "../mapper/Mapper";
import ServiceError from "../error/ServiceError";
import { Between, In, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import ReportService from "./ReportService";
import { ReportStatus } from "../dto/ReportDto";

const handleErr = (err) =>
  err instanceof ServiceError
    ? Promise.reject(err)
    : Promise.reject(
        new ServiceError({ code: 500, message: JSON.stringify(err) })
      );

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

  public getTimesByFilter = async (
    timeFilter: TimeFilter
  ): Promise<TimeDto[]> => {
    let { startDate, endDate, customer, associatedReportId, finalized } = {
      ...timeFilter,
    };

    startDate = startDate ? getDayFromDate(new Date(startDate)) : null;
    endDate = startDate ? getDayFromDate(new Date(endDate)) : null;

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
    if (associatedReportId) {
      filter.associatedReportId = associatedReportId;
    }

    if (finalized !== undefined) {
      filter.finalized = finalized;
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
    timeRequest: Time,
    reportService: ReportService
  ): Promise<TimeDto | ServiceError> => {
    timeRequest.active = true;
    timeRequest.finalized = false;

    // Search for reports that encompass this time
    const associatedReport = await reportService.getReportsByFilter({
      hasDate: timeRequest.day,
    });

    if (associatedReport && associatedReport.length == 1) {
      if (
        associatedReport[0].status === ReportStatus.COMPLETED ||
        associatedReport[0].status === ReportStatus.GENERATING
      ) {
        return Promise.reject(
          new ServiceError({
            code: 409,
            message: `A completed report already exists for this time frame. Update the report to In Progress in order to add a new time. Report ID: ${associatedReport[0].id}`,
          })
        );
      }

      timeRequest.associatedReportId = associatedReport[0].id;
    } else if (associatedReport.length > 1) {
      return Promise.reject(
        new ServiceError({
          code: 500,
          message:
            "Mutliple reports found for this time... that shouldn't happen. Let chandler know!!!",
        })
      );
    }

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

  public finalizeTime = async (
    timeId: string | number,
    finalized: boolean
  ): Promise<void> => {
    return connection
      .then(async (conn) => {
        const existingTime = await conn.manager.findOne(Time, timeId);
        if (!existingTime) {
          return Promise.reject(
            new ServiceError({ code: 404, message: "Time not found" })
          );
        }

        existingTime.finalized = finalized;

        await conn.manager.save(existingTime);
        return Promise.resolve();
      })
      .catch((err) => handleErr(err));
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

        if (existingTime.finalized) {
          return Promise.reject(
            new ServiceError({
              code: 409,
              message: "Cannot update a time that is in a finalized report.",
            })
          );
        }

        const updatedTime = this.mapper.mapTime(timeBody, existingTime);

        return conn.manager
          .save(updatedTime)
          .then((entity) => Promise.resolve(this.mapper.mapToDto(entity)));
      })
      .catch((err) => handleErr(err));
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
        if (existingTime.finalized) {
          return Promise.reject(
            new ServiceError({
              code: 409,
              message: "Cannot delete a time that is in a finalized report.",
            })
          );
        }

        existingTime.active = false;
        existingTime.associatedReportId = null;

        return conn.manager
          .save(existingTime)
          .then((entity) => Promise.resolve());
      })
      .catch((err) => handleErr(err));

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

        merged.active = true;
        merged.finalized = false;

        return conn.manager
          .save(merged)
          .then((entity) => Promise.resolve(this.mapper.mapToDto(entity)));
      })
      .catch((err) => handleErr(err));
  };

  private doMergeTimes = (times: Time[]): Promise<Time> => {
    // Make a clone of the first time
    const mergedTime: Time = this.mapper.mapTime(times[0]);
    if (times[0].associatedReportId)
      mergedTime.associatedReportId = times[0].associatedReportId;
    mergedTime.notes = `${mergedTime.notes} (${mergedTime.minutes} min), `;

    let curr: Time;
    for (let i = 1; i < times.length; i++) {
      curr = times[i];
      mergedTime.minutes += curr.minutes;
      mergedTime.notes += `${curr.notes} (${curr.minutes} min)`;
      if(i < times.length - 1) {
        mergedTime.notes += ", ";
      }
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
      time.associatedReportId === expectedReport &&
      time.finalized === false &&
      time.active == true
  );

  if (validMergeTimes.length != timesToMerge.length) {
    throw "Could not merge entries: customer, serviceItem, report, and billable must be the same, time must not be finalized and must be active. invalid times:" + timesToMerge
      .filter((time) => !validMergeTimes.includes(time))
      .map((t) => t.id); 
  }
  return Promise.resolve(timesToMerge);
};

interface TimeFilter {
  startDate?: any;
  endDate?: any;
  customer?: any;
  associatedReportId?: any;
  finalized?: boolean;
}
