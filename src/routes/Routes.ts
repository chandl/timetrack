import {Request, Response, Application} from "express";
import {Controller} from "../controller/Controller";

class Routes {
    private controller: Controller;

    constructor() {
        this.controller = new Controller();
    }

    public routes(app: Application): void {

        // Default hello 
        app.route("/").get(this.controller.hello);
        
        app.route("/time").post(this.controller.addTime);

    }
}
export {Routes};