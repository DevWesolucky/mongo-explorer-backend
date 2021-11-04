import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { MongoController } from "./MongoController";
import { TimeUtil } from "./util/TimeUtil";
import { DbResult } from "./DbResult";

console.log(`[${TimeUtil.getFullTimestamp()}] process.env > MONGO_URI: ${process.env.MONGO_URI}, PORT: ${process.env.PORT}`)

const mongoController = new MongoController();

const app = express();
const port = process.env.PORT || 5000;
const optionsJson = { limit: '2mb' }; // default 100kB, increase to import big collections
// optionsJson.limit = "5b"; // test middleware error with 5 bytes limit
app.use(cors());
app.use(express.json(optionsJson));
app.use(onMiddlewareError);

function onMiddlewareError(err: Error, req: Request, res: Response, next: NextFunction) {
    res.send(new DbResult(`Express middleware error: ${err.message}`));
}

app.post("/", async (req, res) => {
    const dbResult = await mongoController.handleRequest(req.body);
    res.send(dbResult);
});

app.listen(port, () => console.log(`Express listen at port ${port}`));