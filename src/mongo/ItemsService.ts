import { DbRequest } from "../DbRequest";
import { validateCollectionExists } from "../DbRequestService";
import { DbResult } from "../DbResult";
import { mongoClient } from "./MongoController";

export async function handleItemsRequest(req: DbRequest): Promise<DbResult> {
    const { method } = req;
    switch (method) {
        case "GET":
            return await find(req);
        case "POST":
            return await create(req);
        case "DELETE":
            return await remove(req);
        default:
           return new DbResult(`ItemService handleItemsRequest > unsupported method: ${method}.`);
    }
}

async function find(dbRequest: DbRequest): Promise<DbResult> {
    const errorMessage = validateCollectionExists(dbRequest);
    if (errorMessage) return new DbResult(errorMessage);
    const database = mongoClient.db(dbRequest.db);
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


async function create(dbRequest: DbRequest): Promise<DbResult> {
    const { type, method } = dbRequest;
    return new DbResult(`Request type ${type} and method ${method} not implemented yet.`);
}

async function remove(dbRequest: DbRequest): Promise<DbResult> {
    const { type, method } = dbRequest;
    return new DbResult(`Request type ${type} and method ${method} not implemented yet.`);
}