import { Time } from "../entity/Time";

interface ReportResponse {
  id: number;
  startDate: Date;
  endDate: Date;
  customerTimes: CustomerResponse[];
}

interface CustomerResponse {
  customer: string;
  timeTracked: Time[];
}

export { ReportResponse, CustomerResponse };
