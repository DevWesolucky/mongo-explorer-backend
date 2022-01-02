import { Request } from "express";
import { getCachedDbList } from "./CachedDbRepo";
import { DbRequest } from "./DbRequest";
import { DbRequestType } from "./DbRequestType";

export function toDbRequest(req: Request): DbRequest {
    const dbRequest = new DbRequest(req);
    const uriParts = req.path ? req.path.split("/").filter(name => name && name !== "api") : [];
    // pagination parameters
    const parsedLimit = parseInt(dbRequest.query.limit);
    dbRequest.query.limit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;
    const parsedPage = parseInt(dbRequest.query.page);
    dbRequest.query.page = Number.isInteger(parsedPage) && parsedPage > -1 ? parsedPage : 0;
    // parse path [0]databases/[1]:dbName/[2]:collectionName
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
        if (uriParts[3]) {
            dbRequest.type = "";
        }
    }
    return dbRequest;
}

export function validateNewDatabase(dbRequest: DbRequest, cachedDbList = getCachedDbList()): string {
    const name = dbRequest.body?.name;
    if (typeof name !== "string" || name === "") {
        return "Name for new db in request body should be a non empty string.";
    }
    if (name === "") return "Undefined db name in request body.";
    if (cachedDbList.some(item => item.name === name)) return `Database with the name '${name}' already exists.`;
    return "";
}

export function validateDatabaseExists(dbRequest: DbRequest, cachedDbList = getCachedDbList()): string {
    if (!dbRequest.db) return "Undefined db in request.";
    if (!cachedDbList.some(item => item.name === dbRequest.db)) {
        return `Database with the name ${dbRequest.db} does not exist.`;
    }
    return "";
}

export function validateNewCollection(dbRequest: DbRequest, cachedDbList = getCachedDbList()): string {
    const dbValidationResult = validateDatabaseExists(dbRequest, cachedDbList);
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

