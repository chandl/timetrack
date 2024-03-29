import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Report } from "./Report";

@Entity()
export class Time {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("date")
  day: string;

  @Column()
  customer: string;

  @Column()
  serviceItem: string;

  @Column("text")
  notes: string;

  @Column()
  billable: boolean;

  @Column()
  minutes: number;

  @Column({ nullable: true })
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @ManyToOne(() => Report, (report) => report.times, { onDelete: "SET NULL" })
  associatedReport: Report;

  @Column({ nullable: true })
  associatedReportId: number;

  @Column()
  active: boolean;

  @Column()
  finalized: boolean;
}
