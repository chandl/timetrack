import "reflect-metadata";
import app from "./app";
const PORT = 3000;

app.listen(PORT, () => {
    console.info(`server listening on localhost:${PORT}`);
})
/*createConnection().then(async connection => {
    console.log("Inserting a new user into the database...");
    const time = new Time();
    time.day = new Date();
    time.billable = false;
    time.customer = "Liaison";
    time.minutes = 30;
    time.notes = "did a thing";
    time.serviceItem = "SOMD";

    await connection.manager.save(time);
    console.log("Saved a new user with id: " + time.id);

    console.log("Loading times from the database...");
    const times = await connection.manager.find(Time);
    console.log("Loaded times: ", times);
}).catch(error => console.log(error));
*/