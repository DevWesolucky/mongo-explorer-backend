import { ObjectId } from "mongodb";
import { DbRequest } from "../DbRequest";
import { validateCollectionExists } from "../DbRequestService";
import { DbResult } from "../DbResult";
import { mongoClient } from "./MongoController";

export async function handleItemsRequest(dbRequest: DbRequest): Promise<DbResult> {
    const errorMessage = validateCollectionExists(dbRequest);
    if (errorMessage) return new DbResult(errorMessage);
    const { method } = dbRequest;
    switch (method) {
        case "POST":
            return await create(dbRequest);
        case "GET":
            return await read(dbRequest);
        case "PATCH":
            return await update(dbRequest);
        case "DELETE":
            return await remove(dbRequest);
        default:
            return new DbResult(`ItemService handleItemsRequest > unsupported method: ${method}.`);
    }
}

async function create(dbRequest: DbRequest): Promise<DbResult> {
    const database = this.mongoClient.db(dbRequest.db);
    const collection = database.collection(dbRequest.collection);
    const dbResult = new DbResult();
    if (Array.isArray(dbRequest.body)) {
        await collection.insertMany(dbRequest.body)
            .then(() => {
                dbResult.data = dbRequest.body.length
            })
            .catch((e: Error) => {
                dbResult.errorMessage = e.message
            })
    } else {
        await collection.insertOne(dbRequest.body)
            .then(() => {
                dbResult.data = dbRequest.body
            })
            .catch((e: Error) => {
                dbResult.errorMessage = e.message
            })
    }
    return dbResult;
}

async function read(dbRequest: DbRequest): Promise<DbResult> {
    const database = mongoClient.db(dbRequest.db);
    const collection = database.collection(dbRequest.collection);
    const { page, limit } = dbRequest.query;
    const count = await collection.countDocuments();
    const cursor = collection.find()
        .skip(page * limit)
        .limit(limit);
    const itemList = await cursor.toArray();
    const data = { itemList, count };
    return new DbResult("", data);
}

async function update(dbRequest: DbRequest): Promise<DbResult> {
    const database = this.mongoClient.db(dbRequest.db);
    const collection = database.collection(dbRequest.collection);
    const { query, body } = dbRequest;
    const dbResult = new DbResult();
    if (query._id) query._id = new ObjectId(query._id);
    await collection.updateOne(query, { $set: body })
        .then((res) => {
            dbResult.data = res;
        })
        .catch((e: Error) => {
            dbResult.errorMessage = e.message;
        });
    return dbResult;
}

async function remove(dbRequest: DbRequest): Promise<DbResult> {
    const { type, method } = dbRequest;
    return new DbResult(`Request type ${type} and method ${method} not implemented yet.`);
}