import { Request } from "express";
import { MongoClient } from "mongodb";
import { DbRequest } from "../DbRequest";
import { toDbRequest, updateCachedDbList } from "../DbRequestService";
import { DbRequestType } from "../DbRequestType";
import { DbResult } from "../DbResult";
import { handleCollectionsRequest } from "./CollectionsService";
import { handleDatabasesRequest } from "./DatabasesService";
import { handleItemsRequest } from "./ItemsService";

export enum ConnectionState { DISCONNECTED = "DISCONNECTED", CONNECTING = "CONNECTING", CONNECTED = "CONNECTED" };

let connectionState = ConnectionState.DISCONNECTED;
let mongoUri = process.env.MONGO_URI ?? "mongodb://localhost:27017";
console.log(`MongoController > mongoUri`, mongoUri);

export let mongoClient = new MongoClient(mongoUri);

export async function handleMongoDbRequest(dbRequest: DbRequest): Promise<DbResult> {
    if (connectionState !== ConnectionState.CONNECTED) return new DbResult(`MongoController is in ${connectionState} state.`);
    // const dbRequest = toDbRequest(expressRequest);
    const { type, method, db, collection } = dbRequest;
    console.log(`handleMongoDbRequest > type: ${type}, method: ${method}, db: ${db}, collection: ${collection}`);

    switch (type) {
        case DbRequestType.databases:
            return await handleDatabasesRequest(dbRequest);
        case DbRequestType.collections:
            return await handleCollectionsRequest(dbRequest);
        case DbRequestType.items:
            return await handleItemsRequest(dbRequest);
        default:
            return new DbResult(`Unsupported db request: ${type}`);
    }
}

export async function initMongoConnection() {
    const state = await connect();
    if (state !== ConnectionState.CONNECTED) {
        setTimeout(() => initMongoConnection(), 5000);
    } else {
        updateCachedDbList();
    }
}

async function connect(): Promise<ConnectionState> {
    connectionState = ConnectionState.CONNECTING;
    const start = Date.now();
    await mongoClient.connect()
        .then(() => {
            connectionState = ConnectionState.CONNECTED;
        })
        .catch((e: Error) => {
            console.error(`MongoController.connect > error message: `, e.message);
            connectionState = ConnectionState.DISCONNECTED;
        });

    console.log(`MongoController.connect > connectingTimeMs: ${Date.now() - start}, connectionState: ${connectionState}`);
    return connectionState;
}


