import { Db, MongoClient } from "mongodb";
import { DbRequest } from "../DbRequest";
import { DbResult } from "../DbResult";

export class PostService {

    private mongoClient: MongoClient;

    constructor(mongoClient: MongoClient) {
        this.mongoClient = mongoClient;
    }

    public async handleRequest(dbRequest: DbRequest): Promise<DbResult> {
        const validateResult = this.validateRequest(dbRequest);
        if (validateResult.errorMessage) return validateResult;
        switch (dbRequest.type) {
            case "CREATE_DB":
                return await this.createDb(dbRequest);
            case "CREATE_COLLECTION":
                return await this.createCollection(dbRequest);
            default:
                return await this.insert(dbRequest);
        }
    }

    private validateRequest(dbRequest: DbRequest): DbResult {
        if (!dbRequest.db) return new DbResult("Undefined db.");
        if (dbRequest.type === "CREATE_DB") return new DbResult();
        if (!dbRequest.collection) return new DbResult("Undefined collection.");
        if (dbRequest.type === "CREATE_COLLECTION") return new DbResult();
        if (!dbRequest.data) return new DbResult("Undefined data.");
        return new DbResult();
    }

    private async insert(dbRequest: DbRequest): Promise<DbResult> {
        const database = this.mongoClient.db(dbRequest.db);
        const collection = database.collection(dbRequest.collection);
        const dbResult = new DbResult();
        if (Array.isArray(dbRequest.data)) {
            await collection.insertMany(dbRequest.data)
                .then(() => {
                    dbResult.data = dbRequest.data.length
                })
                .catch((e: Error) => {
                    dbResult.errorMessage = e.message
                })
        } else {
            await collection.insertOne(dbRequest.data)
                .then(() => {
                    dbResult.data = dbRequest.data
                })
                .catch((e: Error) => {
                    dbResult.errorMessage = e.message
                })
        }
        return dbResult;
    }

    private async createDb(dbRequest: DbRequest): Promise<DbResult> {
        const adminDb = this.mongoClient.db().admin();
        // type ListDatabasesResult has not 'databases' field ???
        const res: any = await adminDb.listDatabases();
        if (!res.databases) return new DbResult("Can't find 'databases' field.");
        const nameList = Array.from(res.databases).map((item: any) => item.name);
        if (nameList.includes(dbRequest.db)) return new DbResult(`Db with name '${dbRequest.db}' already exists.`);
        let database: Db;
        // validate name
        try {
            database = this.mongoClient.db(dbRequest.db);
        } catch (error) {
            return new DbResult(error.message)
        }
        const dbResult = new DbResult();
        // new db can't be empty so add empty collection
        await database.createCollection("temp.start")
            .then(() => {
                dbResult.data = dbRequest.db
            })
            .catch((e: Error) => {
                dbResult.errorMessage = e.message
            })

        return dbResult;
    }

    private async createCollection(dbRequest: DbRequest): Promise<DbResult> {
        const database = this.mongoClient.db(dbRequest.db);
        const dbResult = new DbResult();
        await database.createCollection(dbRequest.collection)
            .then(() => {
                dbResult.data = dbRequest.collection
            })
            .catch((e: Error) => {
                dbResult.errorMessage = e.message
            })

        return dbResult;
    }

}