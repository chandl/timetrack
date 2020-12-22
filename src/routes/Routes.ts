import { Request, Response, Application } from "express";
import { TimeController } from "../controller/TimeController";

class Routes {
  private controller: TimeController;

  constructor() {
    this.controller = new TimeController();
  }

  public routes(app: Application): void {
    app
      .route("/time")
      .get(this.controller.getAllTimes)
      .post(this.controller.addTime);

    app
      .route("/time/:id")
      .get(this.controller.getTimeById)
      .put(this.controller.updateTime)
      .delete(this.controller.deleteTime);
  }
}
export { Routes };
