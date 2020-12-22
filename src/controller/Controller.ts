import {Request, Response} from 'express';
import {connection} from "../connection/Connection";
import { Time } from '../entity/Time';

class Controller {
    constructor() {}

    public hello(req: Request, res: Response) {
        connection.then(async conn => {
            const times: Time[] = await conn.manager.find(Time);
            res.json(times);
        }).catch(error => {
            console.error("Error ", error);
            res.json(error);
        })
    }    

}
export {Controller};