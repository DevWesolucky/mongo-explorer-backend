import { MongoClient, ObjectId } from "mongodb";
import { DbRequest } from "../DbRequest";
import { DbResult } from "../DbResult";

export class PatchService {

    private mongoClient: MongoClient;

    constructor(mongoClient: MongoClient) {
        this.mongoClient = mongoClient;
    }

    public async handleRequest(dbRequest: DbRequest): Promise<DbResult> {
        const validateResult = this.validateRequest(dbRequest);
        if (validateResult.errorMessage) return validateResult;
        return await this.updateOne(dbRequest);
    }

    private validateRequest(dbRequest: DbRequest): DbResult {
        if (!dbRequest.db) return new DbResult("Undefined db.");
        if (!dbRequest.collection) return new DbResult("Undefined collection.");
        if (!dbRequest.query) return new DbResult("Undefined query.");
        if (!dbRequest.data) return new DbResult("Undefined data.");
        return new DbResult();
    }

    private async updateOne(dbRequest: DbRequest): Promise<DbResult> {
        const database = this.mongoClient.db(dbRequest.db);
        const collection = database.collection(dbRequest.collection);
        const { query, data } = dbRequest;
        const dbResult = new DbResult();
        if (query._id) query._id = new ObjectId(query._id);
        await collection.updateOne(query, { $set: data })
            .then((res) => { 
                dbResult.data = res;
            })
            .catch((e: Error) => {
                dbResult.errorMessage = e.message;
            });
        return dbResult;
    }
    

}