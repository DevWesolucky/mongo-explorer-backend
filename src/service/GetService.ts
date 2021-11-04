import { MongoClient } from "mongodb";
import { DbRequest } from "../DbRequest";
import { DbResult } from "../DbResult";

export class GetService {

    private mongoClient: MongoClient;

    constructor(mongoClient: MongoClient) {
        this.mongoClient = mongoClient;
    }

    public async handleRequest(dbRequest: DbRequest): Promise<DbResult> {
        const validateResult = this.validateRequest(dbRequest);
        if (validateResult.errorMessage) return validateResult;
        switch (dbRequest.type) {
            case "DB_LIST":
                return await this.getDbList();
            case "COLLECTION_LIST":
                return await this.getCollectionList(dbRequest);
            default:
                return await this.find(dbRequest);
        }
    }

    private validateRequest(dbRequest: DbRequest): DbResult {
        if (dbRequest.type === "DB_LIST") return new DbResult();
        if (!dbRequest.db) return new DbResult("Undefined db.");
        if (dbRequest.type === "COLLECTION_LIST") return new DbResult();
        if (!dbRequest.collection) return new DbResult("Undefined collection.");
        return new DbResult();
    }

    private async find(dbRequest: DbRequest): Promise<DbResult> {
        const database = this.mongoClient.db(dbRequest.db);
        const collection = database.collection(dbRequest.collection);
        const { query, sort, page, limit } = dbRequest;
        const count = await collection.countDocuments(query, {});
        const cursor = collection.find(query)
            .sort(sort)
            .skip(page * limit)
            .limit(dbRequest.limit);
        const itemList = await cursor.toArray();
        const data = { itemList, count };
        return new DbResult("", data);
    }
    
    private async getDbList(): Promise<DbResult> {
        const adminDb = this.mongoClient.db().admin();
        const dbResult = new DbResult("", []);
        // type ListDatabasesResult has not 'databases' field ???
        const res: any = await adminDb.listDatabases();
        if (!res.databases) return new DbResult("Can't find 'databases' field.");
        const nameList = Array.from(res.databases).map((item: any) => item.name);
        for (const name of nameList) {
            const stats = await this.mongoClient.db(name).stats();
            const { collections, dataSize } = stats;
            dbResult.data.push({ name, collections, dataSize });
        }
        return dbResult;
    }

    private async getCollectionList(dbRequest: DbRequest): Promise<DbResult> {
        const database = this.mongoClient.db(dbRequest.db);
        const dbResult = new DbResult("", []);
        const cursor = database.listCollections();
        const itemList = await cursor.toArray();
        for (const item of itemList) {
            const { name } = item;
            const stats = await this.mongoClient.db(dbRequest.db).collection(name).stats();
            const { count, size } = stats;
            dbResult.data.push({ name, count, size });
        }
        return dbResult;
    }

}