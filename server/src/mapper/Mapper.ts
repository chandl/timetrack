import { ReportDto } from "../dto/ReportDto";
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
      associatedReport: dao.associatedReport ? dao.associatedReport.id : null,
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
}

const getDayFromDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export { Mapper };
