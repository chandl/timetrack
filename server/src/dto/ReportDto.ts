export type ReportDto = {
    id: number;
    startDate: string;
    endDate: string;
    generatedFile: string;
    status: string;
}

const ReportStatus = Object.freeze({
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    ON_HOLD: "ON_HOLD"
})

export {ReportStatus};