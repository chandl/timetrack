import * as express from "express";
import * as cors from "cors";
import * as helmet from "helmet";
import * as dotenv from "dotenv";
import * as morgan from "morgan";
import * as prom from "express-prom-bundle";

import { Routes } from "./routes/Routes";
import bodyParser = require("body-parser");
import TimeService from "./service/TimeService";
import ReportService from "./service/ReportService";

const REPORT_DIR = `${process.env.DIR}/reports`;
const PUBLIC_DIR = `${process.env.DIR}/public`;

class App {
  public app: express.Application;
  public routePrv: Routes;
  private timeService: TimeService;
  private reportService: ReportService;

  constructor() {
    dotenv.config();

    this.app = express();
    this.app.use(bodyParser.json()); // support application/x-www-form-urlencodeD
    this.app.use(bodyParser.urlencoded({ extended: false })); // for routing the http request to the controller
    this.app.use(helmet()); // secure http headers
    this.app.use(cors()); // cors support
    this.app.use(morgan("common")); // logging
    this.app.use(prom({ includeMethod: true, includePath: true }));

    this.app.use("/reports", express.static(REPORT_DIR));
    this.app.use(express.static(REPORT_DIR));
    this.app.use("/track/*", express.static(PUBLIC_DIR));
    this.app.use(express.static(PUBLIC_DIR));

    this.timeService = new TimeService();
    this.reportService = new ReportService();

    this.routePrv = new Routes({
      timeService: this.timeService,
      reportService: this.reportService,
    });
    this.routePrv.routes(this.app);

    // Error handling
    this.app.use((err, req, res, next) => {
      if (err && err.error && err.error.isJoi) {
        // we had a joi error, let's return a custom 400 json response
        res.status(400).json({
          type: err.type, // will be "query" here, but could be "headers", "body", or "params"
          message: err.error.toString(),
        });
      } else {
        // pass on to another error handler
        next(err);
      }
    });
  }
}

export default new App().app;
