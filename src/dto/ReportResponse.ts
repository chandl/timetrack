import { Report } from "../entity/Report";

class ReportResponse {
  private report: Report;
  private times: Map<string, any>;

  constructor({ report, times }) {
    this.report = report;
    this.times = times;
  }
}

export { ReportResponse };
