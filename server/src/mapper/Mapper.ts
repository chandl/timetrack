import { ReportDto, ReportTimeDetail, CustomerDetail } from "../dto/ReportDto";
import { TimeDto } from "../dto/TimeDto";
import { Report } from "../entity/Report";
import { Time } from "../entity/Time";

class Mapper {
  constructor() {}

  public mapTime(requestTime: TimeDto | Time, existingTime?: Time): Time {
    const time = existingTime ? existingTime : new Time();

    time.customer = requestTime.customer;
    time.billable = requestTime.billable;
    time.day = new Date(requestTime.day);
    time.minutes = requestTime.minutes;
    time.notes = requestTime.notes;
    time.startTime = requestTime.startTime;
    time.endTime = requestTime.endTime;
    time.serviceItem = requestTime.serviceItem;
    time.active = true;

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
    const mapped: TimeDto = Object.assign({}, dao, {
      day: getDayFromDate(dao.day),
    });
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

  public mapReportDetail(reportDao: Report, times: Time[]): ReportDto {
    const dto = this.mapReportToDto(reportDao);
    dto.details = this.mapTimeDetails(
      reportDao.startDate,
      reportDao.endDate,
      times
    );
    return dto;
  }

  private mapTimeDetails(
    startDate: Date,
    endDate: Date,
    times: Time[]
  ): ReportTimeDetail[] {
    const reportDateRanges = getReportWeeks(startDate, endDate);
    // console.log(
    //   `Found date ranges startDate=${JSON.stringify(
    //     startDate
    //   )} endDate=${JSON.stringify(endDate)} ranges=${JSON.stringify(
    //     reportDateRanges
    //   )}`
    // );

    const details: ReportTimeDetail[] = [];
    reportDateRanges.forEach((dateRange) => {
      const timesInRange = times.filter((t) => {
        const day = getDayFromDate(t.day);
        return day >= dateRange.startDate && day <= dateRange.endDate;
      });

      // sort by customer
      const customerDetailsInRange = this.sortTimesByCustomer(timesInRange);

      // add to response
      details.push({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        customers: customerDetailsInRange,
      });
    });

    return details;
  }

  private sortTimesByCustomer(times: Time[]): CustomerDetail[] {
    // Map the data to response
    const customers = {};
    times.forEach((t) => {
      // clone to prevent report from being overwritten
      const time = Object.assign({}, t);
      delete time.associatedReport;
      customers[time.customer.toLowerCase()] =
        customers[time.customer.toLowerCase()] || [];
      customers[time.customer.toLowerCase()].push(time);
    });

    return Object.keys(customers).map((cust) => {
      return {
        customer: cust,
        times: customers[cust].map((timeDao) => this.mapToDto(timeDao)),
      };
    });
  }
}

const getReportWeeks = (startDate: Date, endDate: Date): DateRange[] => {
  const reportWeeks = [];

  let currStart = new Date(startDate);
  let prevDay = new Date(startDate);
  let currDay = new Date(startDate);

  while (currDay <= endDate) {
    if (currDay.getDay() === 6 && currDay != startDate) {
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

export { Mapper };
