import { Request } from "express";
import { DbRequest } from "./DbRequest";
import { DbRequestType } from "./DbRequestType";

/**
 * 
 * @param req express Request
 * @returns DbRequest with DbRequestType
 */
export function toDbRequest(req: Request): DbRequest {
    const dbRequest = new DbRequest(req);
    const uriParts = req.path ? req.path.split("/").filter(name => name && name !== "api") : [];
    // parse path [0]databases/[1]:dbName/[2]:collectionName/[3]:id
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
            dbRequest.id = uriParts[3];
            dbRequest.type = DbRequestType.item;
        }
        if (uriParts[4]) {
            dbRequest.type = "";
        }
    }
    return dbRequest;
}
