import { TimeDto } from "../dto/TimeDto";
import { Report } from "../entity/Report";
import { Time } from "../entity/Time";

class Mapper {
  constructor() {}

  public mapTime(requestTime: any, existingTime?: Time): Time {
    const time = existingTime ? existingTime : new Time();

    time.customer = requestTime.customer;
    time.billable = requestTime.billable;
    time.day = requestTime.day;
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
      day: dao.day.toISOString().split('T')[0],
      associatedReport: dao.associatedReport? dao.associatedReport.id : null
    });
    return mapped;
  }
}

export { Mapper };
