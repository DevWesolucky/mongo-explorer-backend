import { DbRequest } from "../DbRequest";
import { DbResult } from "../DbResult";
import { mongoClient } from "./MongoController";
import { getCachedDbList, updateCachedDbList } from "../CachedDbRepo";
import { validateRequestDatabaseExists } from "./DatabasesService";

export async function handleCollectionsRequest(dbRequest: DbRequest): Promise<DbResult> {
    const { method } = dbRequest;
    switch (method) {
        case "POST":
            return await create(dbRequest);
        case "GET":
            return await read(dbRequest);
        case "DELETE":
            return await remove(dbRequest);
        default:
            return new DbResult(`handleCollectionsRequest > unsupported method: ${method}.`);
    }
}

async function read(dbRequest: DbRequest): Promise<DbResult> {
    const errorMessage = validateRequestDatabaseExists(dbRequest);
    if (errorMessage) return new DbResult(errorMessage);
    const database = mongoClient.db(dbRequest.db);
    const cursor = database.listCollections();
    const itemList = await cursor.toArray();
    const resList = [];
    for (const item of itemList) {
        const { name } = item;
        const stats = await mongoClient.db(dbRequest.db).collection(name).stats();
        const { count, size } = stats;
        resList.push({ name, count, size });
    }
    return new DbResult("", resList);
}

async function create(dbRequest: DbRequest): Promise<DbResult> {
    const errorMessage = validateNewCollection(dbRequest);
    if (errorMessage) return new DbResult(errorMessage);
    const database = mongoClient.db(dbRequest.db);
    const dbResult = new DbResult("", dbRequest.body.name);
    await database.createCollection(dbRequest.body.name)
        .catch((e: Error) => {
            dbResult.errorMessage = e.message
        })
    if (!dbResult.errorMessage) await updateCachedDbList();
    return dbResult;
}

async function remove(dbRequest: DbRequest): Promise<DbResult> {
    const errorMessage = validateCollectionExists(dbRequest);
    if (errorMessage) return new DbResult(errorMessage);
    const database = mongoClient.db(dbRequest.db);
    const collection = database.collection(dbRequest.collection);
    const dbResult = new DbResult("");
    await collection.drop()
        .then((res) => {
            dbResult.data = res;
        })
        .catch((e: Error) => {
            dbResult.errorMessage = e.message;
        });
    if (!dbResult.errorMessage) await updateCachedDbList();
    return dbResult;
}

export function validateNewCollection(dbRequest: DbRequest, cachedDbList = getCachedDbList()): string {
    const dbValidationResult = validateRequestDatabaseExists(dbRequest, cachedDbList);
    if (dbValidationResult) return dbValidationResult;
    const name = dbRequest.body?.name;
    if (typeof name !== "string" || name === "") {
        return "Name for new collection in request body should be a non empty string.";
    }
    const cachedDatabase = cachedDbList.find(item => item.name === dbRequest.db);
    if (cachedDatabase.collectionNameList.some(item => item === name)) {
        return `Collection with the name ${name} already exists.`;
    }
    return "";
}

export function validateCollectionExists(dbRequest: DbRequest, cachedDbList = getCachedDbList()): string {
    if (!dbRequest.db) return "Undefined db in request.";
    const cachedDatabase = cachedDbList.find(item => item.name === dbRequest.db);
    if (!cachedDatabase) return `Database with the name ${dbRequest.db} does not exist.`;
    if (!dbRequest.collection) return "Undefined collection in request.";
    if (!cachedDatabase.collectionNameList.some(item => item === dbRequest.collection)) {
        return `Collection with the name ${dbRequest.collection} does not exist.`;
    }
    return "";
}
