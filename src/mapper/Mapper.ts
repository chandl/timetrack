import { Time } from "../entity/Time";

class Mapper {
    constructor() {}

    public mapTime(requestTime: any, existingTime?: Time): Time {
        const time = (existingTime) ? existingTime : new Time();

        time.customer = requestTime.customer;
        time.billable = requestTime.billable;
        time.day = requestTime.day;
        time.minutes = requestTime.minutes;
        time.notes = requestTime.notes;
        time.startTime = requestTime.startTime;
        time.endTime = requestTime.endTime;
        time.serviceItem = requestTime.serviceItem;

        return time;
    }
}

export {Mapper};