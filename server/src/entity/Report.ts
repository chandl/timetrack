import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Time } from "./Time";

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("date")
  startDate: string;

  @Column("date")
  endDate: string;

  @Column({ nullable: true })
  generatedFile: string;

  @Column()
  status: string;

  @OneToMany(() => Time, (time) => time.associatedReport)
  times: Time[];
}
