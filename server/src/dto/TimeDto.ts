export interface TimeDto {
  id: number;
  day: string;
  customer: string;
  serviceItem: string;
  notes: string;
  billable: boolean;
  minutes: number;
  startTime: Date;
  endTime: Date;
  associatedReportId: number;
}
