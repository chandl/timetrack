import { Report } from "../entity/Report";

class ReportResponse {
  private report: Report;
  private times: Map<string, any>;

  constructor( report: Report, times:Map<string, any> ) {
    this.report = report;
    this.times = times;
  }
}

export { ReportResponse };
