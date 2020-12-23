import { Request, Response, Application } from "express";
import { ReportController } from "../controller/ReportController";
import { TimeController } from "../controller/TimeController";

class Routes {
  private timeController: TimeController;
  private reportController: ReportController;

  constructor() {
    this.timeController = new TimeController();
    this.reportController = new ReportController();
  }

  public routes(app: Application): void {
    app
      .route("/time")
      .get(this.timeController.getTimes)
      .post(this.timeController.addTime);

    app
      .route("/time/:id")
      .get(this.timeController.getTimeById)
      .put(this.timeController.updateTime)
      .delete(this.timeController.deleteTime);

    app
      .route("/time/merge")
      .post(this.timeController.mergeTime);


    app.route("/report")
        .post(this.reportController.newReport)
        .get(this.reportController.getReports);

    app.route("/report/:id")
        .get(this.reportController.getReportById)
        .put(this.reportController.updateReport)
        .delete(this.reportController.deleteReport);
  }
}
export { Routes };
