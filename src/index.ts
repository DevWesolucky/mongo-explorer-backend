import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { handleMongoDbRequest, initMongoConnection } from "./mongo/MongoController";
import { TimeUtil } from "./util/TimeUtil";
import { DbResult } from "./DbResult";
import { DbRequest } from "./DbRequest";
import { toDbRequest } from "./DbRequestService";

console.log(`[${TimeUtil.getFullTimestamp()}] process.env > MONGO_URI: ${process.env.MONGO_URI}, 
PORT: ${process.env.PORT}`)

initMongoConnection();

const app = express();
const port = process.env.PORT || 5000;
const optionsJson = { limit: '2mb' }; // default 100kB, increase to import big collections
// optionsJson.limit = "5b"; // test middleware error with 5 bytes limit
app.use(cors());
app.use(express.json(optionsJson));
app.use(handleMiddlewareError);

function handleMiddlewareError(err: Error, req: Request, res: Response, next: NextFunction) {
    res.send(new DbResult(`Express middleware error: ${err.message}`));
}

async function handleRequest(req: Request, res: Response) {
    const dbRequest = toDbRequest(req); // parse expressRequest to dbRequest
    if (!dbRequest.type) {
        res.send(new DbResult(`Can't resolve url '${req.url}' to db request.`));
        return;
    }
    const dbResult = await processRequest(dbRequest);
    res.send(dbResult);
}

export async function processRequest(dbRequest: DbRequest): Promise<DbResult> {
    const dbResult = await handleMongoDbRequest(dbRequest);
    console.log(`index handleRequest > dbResult`, dbResult);
    return dbResult;
}

app.use(handleRequest);

app.listen(port, () => console.log(`Express listen at port ${port}`));