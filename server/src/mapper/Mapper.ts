import {
  ReportDto,
  ReportTimeDetail,
  CustomerDetail,
  WeekdayInfo,
} from "../dto/ReportDto";
import { TimeDto } from "../dto/TimeDto";
import { Report } from "../entity/Report";
import { Time } from "../entity/Time";

class Mapper {
  constructor() {}

  public mapTime(requestTime: TimeDto | Time, existingTime?: Time): Time {
    const time = existingTime ? existingTime : new Time();

    time.customer = requestTime.customer;
    time.billable = requestTime.billable;
    time.day = getDayFromDate(new Date(requestTime.day));
    time.minutes = requestTime.minutes;
    time.notes = requestTime.notes;
    time.startTime = requestTime.startTime;
    time.endTime = requestTime.endTime;
    time.serviceItem = requestTime.serviceItem;

    if (requestTime.associatedReportId)
      time.associatedReportId = requestTime.associatedReportId;

    return time;
  }

  public mapReport(requestReport: any, existingreport?: Report): Report {
    const report = existingreport ? existingreport : new Report();
    report.startDate = requestReport.startDate;
    report.endDate = requestReport.endDate;
    report.generatedFile = requestReport.generatedFile;

    return report;
  }

  public mapToDto(dao: Time): TimeDto {
    delete dao.active;
    const mapped: TimeDto = Object.assign({}, dao);
    if (!dao.startTime) delete mapped.startTime;
    if (!dao.endTime) delete mapped.endTime;
    return mapped;
  }

  public mapReportToDto(dao: Report): ReportDto {
    const mapped: ReportDto = Object.assign({}, dao, {
      startDate: getDayFromDate(new Date(dao.startDate)),
      endDate: getDayFromDate(new Date(dao.endDate)),
    });

    if (!dao.generatedFile) delete mapped.generatedFile;

    return mapped;
  }

  public mapReportDetail(reportDao: Report, times: TimeDto[]): ReportDto {
    const dto = this.mapReportToDto(reportDao);
    dto.details = this.mapTimeDetails(
      reportDao.startDate,
      reportDao.endDate,
      times
    );
    return dto;
  }

  private mapTimeDetails(
    startDate: string,
    endDate: string,
    times: TimeDto[]
  ): ReportTimeDetail[] {
    const reportDateRanges = getReportWeeks(startDate, endDate);

    const details: ReportTimeDetail[] = [];
    reportDateRanges.forEach((dateRange) => {
      const timesInRange = times.filter((t) => {
        const day = t.day;
        return day >= dateRange.startDate && day <= dateRange.endDate;
      });

      // sort by customer
      const customerDetailsInRange = this.sortTimesByCustomer(timesInRange);

      // format per day
      const formattedWeek = this.formatWeeklyReport(
        dateRange.startDate,
        dateRange.endDate,
        customerDetailsInRange
      );

      // add to response
      details.push({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        customers: customerDetailsInRange,
        formatted: formattedWeek,
      });
    });

    return details;
  }

  private formatWeeklyReport = (
    startDate: string,
    endDate: string,
    customerDetails: CustomerDetail[]
  ): WeekdayInfo[] => {
    // Create WeekdayInfo between startDate/endDate
    const weekdays: WeekdayInfo[] = [];
    let day = new Date(startDate);
    const endDay = new Date(endDate);
    while (day.getUTCDay() <= 5 && day <= endDay) {
      if (day.getUTCDay() >= 1) {
        weekdays.push({
          dayDate: getDayFromDate(day),
          dayName: getWeekday(day.getUTCDay()),
          totalTime: 0,
          times: [],
        });
      }
      day.setDate(day.getDate() + 1);
    }

    let currWeekday = 0;
    customerDetails.forEach((cust) => {
      cust.times
        .sort((t1, t2) => t2.minutes - t1.minutes)
        .forEach((time) => {
          // go to next day if 8 hours have been logged for one day
          if (
            weekdays[currWeekday].totalTime >= 480 &&
            currWeekday < weekdays.length - 1
          ) {
            currWeekday += 1;
          }

          const roundedMinutes = roundMinutesToNearestFifteen(time.minutes);
          weekdays[currWeekday].totalTime += roundedMinutes;
          weekdays[currWeekday].times.push(
            Object.assign({}, time, { minutes: roundedMinutes })
          );
        });
    });

    return weekdays.filter((day) => day.totalTime > 0);
  };

  private sortTimesByCustomer(times: TimeDto[]): CustomerDetail[] {
    // Map the data to response
    const customers = {};
    times.forEach((t) => {
      // clone to prevent report from being overwritten
      const time = Object.assign({}, t);
      customers[time.customer.toLowerCase()] =
        customers[time.customer.toLowerCase()] || [];
      customers[time.customer.toLowerCase()].push(time);
    });

    return Object.keys(customers).map((cust) => {
      return {
        customer: cust,
        times: customers[cust],
      };
    });
  }
}

const getReportWeeks = (startDate: string, endDate: string): DateRange[] => {
  const reportWeeks = [];

  const startDayDate = new Date(startDate);
  const endDayDate = new Date(endDate);

  let currStart = new Date(startDate);
  let prevDay = new Date(startDate);
  let currDay = new Date(startDate);

  while (currDay <= endDayDate) {
    if (currDay.getDay() === 0 && currDay != startDayDate) {
      // sunday - start new week
      reportWeeks.push({
        startDate: getDayFromDate(currStart),
        endDate: getDayFromDate(prevDay),
      });

      currStart = new Date(currDay);
    }

    prevDay = new Date(currDay);
    currDay.setDate(currDay.getDate() + 1);
  }

  if (prevDay != currStart) {
    reportWeeks.push({
      startDate: getDayFromDate(currStart),
      endDate: getDayFromDate(prevDay),
    });
  }

  return reportWeeks;
};

type DateRange = {
  startDate: string;
  endDate: string;
};

const getDayFromDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const getWeekday = (dayNumber) => dayNames[dayNumber];
const roundMinutesToNearestFifteen = (min) => Math.ceil(min / 15) * 15;

export { Mapper, getDayFromDate };
