import { Request, Response, Application } from "express";
import { ReportController } from "../controller/ReportController";
import { TimeController } from "../controller/TimeController";
import * as Joi from "joi";
import { ValidatedRequest, createValidator } from "express-joi-validation";

const validator = createValidator({
  passError: true,
});
const timeSchema = Joi.object({
  day: Joi.date().required(),
  customer: Joi.string().required(),
  serviceItem: Joi.string().required(),
  notes: Joi.string().required(),
  billable: Joi.bool().required(),
  minutes: Joi.number().integer().required(),
  startTime: Joi.date().optional(),
  endTime: Joi.date().optional(),
});

const validIdParam = Joi.object({
  id: Joi.number().integer().required(),
});

const reportCreateSchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
});

class Routes {
  private timeController: TimeController;
  private reportController: ReportController;

  constructor(services) {
    this.timeController = new TimeController(services);
    this.reportController = new ReportController(services);
  }

  public routes(app: Application): void {
    app
      .route("/time")
      .get(this.timeController.getTimes)
      .post(validator.body(timeSchema), (req: ValidatedRequest<any>, res) =>
        this.timeController.addTime(req, res)
      );

    app
      .route("/time/:id")
      .get(validator.params(validIdParam), this.timeController.getTimeById)
      .put(
        validator.params(validIdParam),
        validator.body(timeSchema),
        (req: ValidatedRequest<any>, res) =>
          this.timeController.updateTime(req, res)
      )
      .delete(validator.params(validIdParam), this.timeController.deleteTime);

    app.route("/time/merge").post(this.timeController.mergeTime);

    app
      .route("/report")
      .post(validator.body(reportCreateSchema), this.reportController.newReport)
      .get(this.reportController.getReports);

    app
      .route("/report/:id")
      .get(validator.params(validIdParam), this.reportController.getReportById)
      .put(validator.params(validIdParam), this.reportController.updateReport)
      .delete(
        validator.params(validIdParam),
        this.reportController.deleteReport
      );

    app
      .route("/report/finalize/:id")
      .post(
        validator.params(validIdParam),
        this.reportController.finalizeReport
      );
  }
}
export { Routes };
