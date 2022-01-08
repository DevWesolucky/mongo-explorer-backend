import { Request } from "express";
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
