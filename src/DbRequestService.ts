import { Request } from "express";
import { ListDatabasesResult } from "mongodb";
import { DbRequest } from "./DbRequest";
import { DbRequestType } from "./DbRequestType";
import { mongoClient } from "./mongo/MongoController";

/**
 * MongoDB does not throw error if database or collection with the name from request
 * does not exist. So preserve data here to don't list databases and collections
 * at evry request (e.g. /api/databases/fake-db/fake-collection/itemId)
 */
type Database = {
    name: string,
    collectionNameList: Array<string>
}
let cachedDbList: Array<Database> = [];

export function toDbRequest(req: Request): DbRequest {
    const uriParts = req.url ? req.url.split("/").filter(name => name && name !== "api") : [];
    console.log(`getDbRequest > uriParts`, uriParts);
    const dbRequest = new DbRequest(req);
    // parse URI [0]databases/[1]:dbName/[2]:collectionName
    if (uriParts[0] === DbRequestType.databases) {
        dbRequest.type = DbRequestType.databases;
        if (uriParts[1]) {
            dbRequest.db = uriParts[1];
            dbRequest.type = DbRequestType.collections;
        }
        if (uriParts[2]) {
            dbRequest.collection = uriParts[2];
            dbRequest.type = DbRequestType.items;
        }
    }
    return dbRequest;
}

export function getCachedDbList() {
    return cachedDbList;
}

export function validateNewDatabase(dbRequest: DbRequest): string {
    const name = dbRequest.body?.name;
    if (typeof name !== "string") return "name for new db in request body should be a string.";
    if (!name) return "Undefined db name in request body.";
    if (cachedDbList.find(item => item.name === name)) return `Database with name '${name}' already exists.`;
    return "";
}

export function validateDatabaseExists(dbRequest: DbRequest): string {
    if (!dbRequest.db) return "Undefined db in request.";
    const database = cachedDbList.find(item => item.name === dbRequest.db);
    if (!database) return `Database with name ${dbRequest.db} does not exist.`;
    return "";
}

export function validateNewCollection(dbRequest: DbRequest): string {
    if (!dbRequest.db) return "Undefined db in request.";
    if (!dbRequest.collection) return "Undefined collection in request.";
    return "";
}

export function validateCollectionExists(dbRequest: DbRequest): string {
    if (!dbRequest.db) return "Undefined db in request.";
    const database = cachedDbList.find(item => item.name === dbRequest.db);
    if (!database) return `Database with name ${dbRequest.db} does not exist.`;
    if (!dbRequest.collection) return "Undefined collection in request.";
    // TO CHECK > mongoDb trhow error if collection to drop does not exist?
    if (!database.collectionNameList.find(item => item === dbRequest.collection)) {
        return `Collection with name ${dbRequest.collection} does not exist.`;
    }
    return "";
}

export async function updateCachedDbList() {
    cachedDbList = [];
    const adminDb = mongoClient.db().admin();
    const res: ListDatabasesResult = await adminDb.listDatabases();
    const dbNameList = Array.from(res.databases).map(item => item.name);
    
    for (const name of dbNameList) {
        const db: Database = { name, collectionNameList: [] };
        cachedDbList.push(db);
        const database = mongoClient.db(name);
        const cursor = database.listCollections();
        const itemList = await cursor.toArray();
        db.collectionNameList = itemList.map(item => item.name);
    }
}


