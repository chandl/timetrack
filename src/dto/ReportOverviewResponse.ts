import { Report } from "../entity/Report";

export class ReportOverviewResponse {
    private reports: Report[];
    private totalTime: number;

    constructor(reports: Report[], totalTime: number) {
        this.reports = reports;
        this.totalTime = totalTime;
    }
}