import {Request, Response} from 'express';
import e = require('express');
import {connection} from "../connection/Connection";
import { Time } from '../entity/Time';
import { Mapper }  from "../mapper/Mapper";

const mapper = new Mapper();
class Controller {
    constructor() {}

    public hello(req: Request, res: Response) {
        res.json({
            "message": "hello world!"
        });
        // connection.then(async conn => {
        //     const times: Time[] = await conn.manager.find(Time);
        //     res.json(times);
        // }).catch(error => {
        //     console.error("Error ", error);
        //     res.json(error);
        // })
    }

    public addTime(req: Request, res:Response) {
        const time = mapper.mapTime(req.body);
        connection.then(async conn => {
            console.log("Adding time:", time);
            conn.manager.save(time).then(entity => {
                res.status(200).json(entity);
            });
        }).catch(err => {
            console.error("Error adding time", err);
            res.json(err);
        })
    }

}
export {Controller};