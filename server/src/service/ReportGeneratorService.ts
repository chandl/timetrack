import { ReportDto } from "../dto/ReportDto";
import { writeFile } from "fs";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("1234567890abcdef", 4);

const REPORT_DIR = `${process.env.DIR}/reports`;
export default class ReportGenerator {
  constructor() {}

  public generateReport = async (finalReport: ReportDto): Promise<string> => {
    console.log("MOCK GENERATING REPORT");
    const body = JSON.stringify(finalReport);

    const fileName = `report-${finalReport.id}-${nanoid()}.txt`;
    const filePath = `${REPORT_DIR}/${fileName}`;

    console.log("WRITING TO", filePath);
    console.log("ENV", process.env.DIR);
    writeFile(filePath, body, () => {});

    await new Promise((f) => setTimeout(f, 5000));
    console.log("FINISHED MOCK REPORT");
    return Promise.resolve(`http://localhost:3000/reports/${fileName}`);
  };
}
