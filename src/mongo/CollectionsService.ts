import { DbRequest } from "../DbRequest";
import { DbResult } from "../DbResult";
import { mongoClient } from "./MongoController";
import {
    updateCachedDbList, validateNewCollection,
    validateCollectionExists, validateDatabaseExists
} from "../DbRequestService";

export async function handleCollectionsRequest(req: DbRequest): Promise<DbResult> {
    const { method } = req;
    switch (method) {
        case "GET":
            return await find(req);
        case "POST":
            return await create(req);
        case "DELETE":
            return await remove(req);
        default:
            return new DbResult(`handleCollectionsRequest > unsupported method: ${method}.`);
    }
}

/**
 * Get collection list
 * @param dbRequest 
 * @returns DbResult with collection list
 */
async function find(dbRequest: DbRequest): Promise<DbResult> {
    const errorMessage = validateDatabaseExists(dbRequest);
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

/**
 * Create collection
 * @param dbRequest 
 * @returns DbResult with new collection name if succes, error message if failure
 */
async function create(dbRequest: DbRequest): Promise<DbResult> {
    const errorMessage = validateNewCollection(dbRequest);
    if (errorMessage) return new DbResult(errorMessage);
    const database = mongoClient.db(dbRequest.db);
    const dbResult = new DbResult(dbRequest.collection);
    await database.createCollection(dbRequest.collection)
        .catch((e: Error) => {
            dbResult.errorMessage = e.message
        })
    if (!dbResult.errorMessage) await updateCachedDbList();
    return dbResult;
}

/**
 * Delete collection
 * @param dbRequest 
 * @returns DbResult
 */
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