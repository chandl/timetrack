import { Report } from "../entity/Report";
import { ReportDto } from "./ReportDto";

class ReportResponse {
  private report: ReportDto;
  private times: Map<string, any>;

  // TODO make change so that this is separated by workweek
  constructor(report: ReportDto, times: Map<string, any>) {
    this.report = report;
    this.times = times;
  }
}

export { ReportResponse };
