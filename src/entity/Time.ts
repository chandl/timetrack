import {Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Time {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    day: Date;

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
    
    @Column({nullable: true})
    startTime: Date;
    
    @Column({nullable: true})
    endTime: Date;
}