import { MongoClient, ObjectId } from "mongodb";
import { DbRequest } from "../DbRequest";
import { DbResult } from "../DbResult";

export class DeleteService {

    private mongoClient: MongoClient;

    constructor(mongoClient: MongoClient) {
        this.mongoClient = mongoClient;
    }

    public async handleRequest(dbRequest: DbRequest): Promise<DbResult> {
        const validateResult = this.validateRequest(dbRequest);
        if (validateResult.errorMessage) return validateResult;
        if (dbRequest.type === "DELETE_COLLECTION") {
            return await this.deleteCollection(dbRequest);
        }
        return await this.deleteOne(dbRequest);
    }

    private validateRequest(dbRequest: DbRequest): DbResult {
        if (!dbRequest.db) return new DbResult("Undefined db.");
        if (!dbRequest.collection) return new DbResult("Undefined collection.");
        if (dbRequest.type === "DELETE_COLLECTION") return new DbResult();
        if (!dbRequest.query) return new DbResult("Undefined query.");
        return new DbResult();
    }

    private async deleteCollection(dbRequest: DbRequest): Promise<DbResult> {
        const database = this.mongoClient.db(dbRequest.db);
        const collection = database.collection(dbRequest.collection);
        const dbResult = new DbResult();
        await collection.drop()
            .then((res) => { 
                dbResult.data = res;
            })
            .catch((e: Error) => {
                dbResult.errorMessage = e.message;
            });
        return dbResult;
    }
    
    private async deleteOne(dbRequest: DbRequest): Promise<DbResult> {
        const database = this.mongoClient.db(dbRequest.db);
        const collection = database.collection(dbRequest.collection);
        const { query } = dbRequest;
        const dbResult = new DbResult();
        if (query._id) query._id = new ObjectId(query._id);
        await collection.deleteOne(query)
            .then((res) => { 
                dbResult.data = res;
            })
            .catch((e: Error) => {
                dbResult.errorMessage = e.message;
            });
        return dbResult;
    }

}