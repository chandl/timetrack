import { TimeDto } from "./TimeDto";

interface ReportDto {
  id: number;
  startDate: string;
  endDate: string;
  generatedFile: string;
  status: string;
  details?: ReportTimeDetail[];
}

interface ReportTimeDetail {
  startDate: string;
  endDate: string;
  customers: CustomerDetail[];
}

interface CustomerDetail {
  customer: string;
  times: TimeDto[];
}

const ReportStatus = Object.freeze({
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  ON_HOLD: "ON_HOLD",
});

export { ReportStatus, ReportTimeDetail, CustomerDetail, ReportDto };
