import * as express from 'express';
import * as cors from "cors";
import * as helmet from "helmet";
import * as dotenv from "dotenv";
import * as morgan from "morgan";
import {Routes} from "./routes/Routes";
import bodyParser = require("body-parser");

class App { 
    public app: express.Application;
    public routePrv: Routes;

    constructor() {
        dotenv.config();

        this.app = express();
        this.app.use(bodyParser.json()); // support application/x-www-form-urlencodeD
        this.app.use(bodyParser.urlencoded({extended: false})); // for routing the http request to the controller
        this.app.use(helmet()); // secure http headers
        this.app.use(cors()); // cors support
        this.app.use(morgan("tiny")); // logging

        this.routePrv = new Routes();
        this.routePrv.routes(this.app);
    }
}

export default new App().app;