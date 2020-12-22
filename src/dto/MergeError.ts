import { Time } from "../entity/Time";

interface MergeError {
    message: string, 
    invalid: Time[],
    expected: {
        billable: boolean,
        customer: string,
        serviceItem: string
    }
}

export {MergeError};