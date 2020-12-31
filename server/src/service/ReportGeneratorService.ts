import { ReportDto } from "../dto/ReportDto";

export default class ReportGenerator {
  constructor() {}

  public generateReport = async (finalReport: ReportDto): Promise<string> => {
    console.log("MOCK GENERATING REPORT");
    await new Promise((f) => setTimeout(f, 60000));
    console.log("FINISHED MOCK REPORT");
    return Promise.resolve("http://google.com");
  };
}
