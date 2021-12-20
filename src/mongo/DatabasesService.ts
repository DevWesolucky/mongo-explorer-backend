import { Db, ListDatabasesResult } from "mongodb";
import { DbRequest } from "../DbRequest";
import { updateCachedDbList, validateNewDatabase } from "../DbRequestService";
import { DbResult } from "../DbResult";
import { mongoClient } from "./MongoController";

export async function handleDatabasesRequest(dbRequest: DbRequest): Promise<DbResult> {
    const { method } = dbRequest;
    switch (method) {
        case "GET":
            return await find();
        case "POST":
            return await create(dbRequest);
        default:
            return new DbResult(`handleDatabasesRequest > unsupported method: ${method}.`);
    }
}

async function find(): Promise<DbResult> {
    const dbNameListResult = await getDbNameList();
    if (dbNameListResult.errorMessage) return dbNameListResult;

    const resList = [];
    for (const name of dbNameListResult.data) {
        const stats = await mongoClient.db(name).stats();
        const { collections, dataSize } = stats;
        resList.push({ name, collections, dataSize });
    }
    return new DbResult("", resList);
}

async function getDbNameList(): Promise<DbResult> {
    const adminDb = mongoClient.db().admin();
    const res: ListDatabasesResult = await adminDb.listDatabases();
    const nameList = Array.from(res.databases).map((item: any) => item.name);
    return new DbResult("", nameList);
}

async function create(dbRequest: DbRequest): Promise<DbResult> {
    const errorMessage = validateNewDatabase(dbRequest);
    if (errorMessage) return new DbResult(errorMessage);

    let database: Db;
    // validate name (e.g. restricted chars) by try create with name from request
    try {
        database = mongoClient.db(dbRequest.body.name);
    } catch (error: any) {
        return new DbResult(error.message);
    }
    const dbResult = new DbResult("", dbRequest.body.name);
    // new db can't be empty so add empty collection
    await database.createCollection("temp.start")
        .catch((e: Error) => {
            dbResult.errorMessage = e.message
        })
    // if success add db to cache
    if (!dbResult.errorMessage) await updateCachedDbList();
    return dbResult;
}