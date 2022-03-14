import { MongoClient } from "mongodb";
import { updateCachedDbList } from "../CachedDbRepo";
import { DbRequest } from "../DbRequest";
import { DbRequestType } from "../DbRequestType";
import { DbResult } from "../DbResult";
import { handleCollectionsRequest } from "./CollectionsService";
import { handleDatabasesRequest } from "./DatabasesService";
import { handleItemsRequest } from "./ItemsService";

export enum ConnectionState {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
}

let connectionState = ConnectionState.DISCONNECTED;
export let mongoClient: MongoClient;

export async function initMongoConnection(uri: string): Promise<string> {
  mongoClient = new MongoClient(uri);
  await connect();
  if (connectionState === ConnectionState.CONNECTED) {
    await updateCachedDbList();
  }
  return connectionState;
}

async function connect(): Promise<ConnectionState> {
  connectionState = ConnectionState.CONNECTING;
  await mongoClient
    .connect()
    .then(() => {
      connectionState = ConnectionState.CONNECTED;
    })
    .catch((e: Error) => {
      console.error(`MongoController.connect > error message: `, e.message);
      connectionState = ConnectionState.DISCONNECTED;
    });
  return connectionState;
}

export async function closeMongoConnection() {
  if (connectionState !== ConnectionState.CONNECTED) return;
  await mongoClient.close();
  connectionState = ConnectionState.DISCONNECTED;
}

export async function handleMongoDbRequest(
  dbRequest: DbRequest
): Promise<DbResult> {
  if (connectionState !== ConnectionState.CONNECTED)
    return new DbResult(`MongoController is in ${connectionState} state.`);
  const { type, method, db, collection } = dbRequest;
  console.log(
    `handleMongoDbRequest > type: ${type}, method: ${method}, db: ${db}, collection: ${collection}`
  );

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
