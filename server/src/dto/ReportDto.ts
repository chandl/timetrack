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
  formatted: WeekdayInfo[];
}

type WeekdayInfo = {
  dayDate: string;
  dayName: string;
  totalTime: number;
  times: TimeDto[];
};

interface CustomerDetail {
  customer: string;
  times: TimeDto[];
}

const ReportStatus = Object.freeze({
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  GENERATING: "GENERATING",
  ON_HOLD: "ON_HOLD",
});

export {
  ReportStatus,
  ReportTimeDetail,
  CustomerDetail,
  WeekdayInfo,
  ReportDto,
};
