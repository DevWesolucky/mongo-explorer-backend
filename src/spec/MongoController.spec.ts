// import { DbResult } from "../DbResult";
import { MongoController } from "../MongoController";

describe("handleRequest", () => {
    it("return db result"), async () => {
        const mongoController = new MongoController();
        const rawReq = {};
        const res = await mongoController.handleRequest(rawReq);
        expect(res.errorMessage).toBe(``);
    }
})