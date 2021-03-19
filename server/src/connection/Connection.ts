import { createConnection } from "typeorm";

const MAX_RETRIES = 10;
const RETRY_DELAY = 500;

const getConnection = async () => {
    let delay = RETRY_DELAY;
    let conn;
    for (let i = 0; i < MAX_RETRIES; i++) {
        let error;
        createConnection().then(c => conn = c).catch(err => error = err);
        if ( conn ) break;
        console.log(`Failed to connect to database, retrying (attempt ${i + 1}/${MAX_RETRIES}) in ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        delay += RETRY_DELAY
    }

    if (!conn) {
        console.error("FATAL: Failed to connect to the database. Exiting");
        process.exit(-1);
    }

    console.log("Successfully connected to the database")
    return conn;
}

export const connection = getConnection();
