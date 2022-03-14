import { Db, ListDatabasesResult } from "mongodb";
import { getCachedDbList, updateCachedDbList } from "../CachedDbRepo";
import { DbRequest } from "../DbRequest";
import { DbResult } from "../DbResult";
import { mongoClient } from "./MongoController";

export async function handleDatabasesRequest(
  dbRequest: DbRequest
): Promise<DbResult> {
  const { method } = dbRequest;
  switch (method) {
    case "POST":
      return await create(dbRequest);
    case "GET":
      return await read();
    case "DELETE":
      return await remove(dbRequest);
    default:
      return new DbResult(
        `handleDatabasesRequest > unsupported method: ${method}.`
      );
  }
}

async function read(): Promise<DbResult> {
  const dbNameListResult = await getDbNameList();
  if (dbNameListResult.errorMessage) return dbNameListResult;

  const resList = [];
  for (const name of dbNameListResult.data) {
    const stats = await mongoClient.db(name).stats();
    const { collections, dataSize } = stats;
    resList.push({ name, collections, dataSize });
  }
  return new DbResult("", resList);
}

async function getDbNameList(): Promise<DbResult> {
  const res: ListDatabasesResult = await mongoClient
    .db()
    .admin()
    .listDatabases();
  const nameList = Array.from(res.databases).map((item: any) => item.name);
  return new DbResult("", nameList);
}

async function create(dbRequest: DbRequest): Promise<DbResult> {
  // const errorMessage = validateNewDatabase(dbRequest);
  // if (errorMessage) return new DbResult(errorMessage);

  let database: Db;
  // validate name (e.g. restricted chars) by try create with name from request
  try {
    console.log(`create > dbRequest.body.name`, dbRequest.body.name);
    database = mongoClient.db(dbRequest.body.name);
  } catch (error: any) {
    console.log(`create > error`, error);
    return new DbResult(error.message);
  }
  const dbResult = new DbResult("", dbRequest.body.name);
  // new db can't be empty so add empty collection
  await database.createCollection("temp.start").catch((e: Error) => {
    dbResult.errorMessage = e.message;
  });
  // if success add db to cache
  if (!dbResult.errorMessage) await updateCachedDbList();
  return dbResult;
}

async function remove(dbRequest: DbRequest): Promise<DbResult> {
  const errorMessage = validateDatabaseToDelete(dbRequest);
  if (errorMessage) return new DbResult(errorMessage);
  const database = mongoClient.db(dbRequest.body.name);
  const cursor = database.listCollections();
  const itemList = await cursor.toArray();
  const dbResult = new DbResult("");
  for (const item of itemList) {
    const { name } = item;
    const collection = database.collection(name);
    await collection
      .drop()
      .then((res) => {
        dbResult.data = res;
      })
      .catch((e: Error) => {
        dbResult.errorMessage = e.message;
      });
  }
  await updateCachedDbList();
  return dbResult;
}

export function validateNewDatabase(
  dbRequest: DbRequest,
  cachedDbList = getCachedDbList()
): string {
  const validationResult = validateDatabaseNameInRequestBody(dbRequest);
  if (validationResult) return validationResult;
  const name = dbRequest.body.name;
  if (cachedDbList.some((item) => item.name === name))
    return `Database with the name '${name}' already exists.`;
  return "";
}

function validateDatabaseNameInRequestBody(dbRequest: DbRequest): string {
  const name = dbRequest.body?.name;
  if (typeof name !== "string" || name === "") {
    return "Name for db in request body should be a non empty string.";
  }
  return "";
}

export function validateDatabaseToDelete(
  dbRequest: DbRequest,
  cachedDbList = getCachedDbList()
): string {
  const validationResult = validateDatabaseNameInRequestBody(dbRequest);
  if (validationResult) return validationResult;
  const name = dbRequest.body.name;
  if (!cachedDbList.some((item) => item.name === name))
    return `Database with the name '${name}' does not exist.`;
  return "";
}

export function validateRequestDatabaseExists(
  dbRequest: DbRequest,
  cachedDbList = getCachedDbList()
): string {
  if (!dbRequest.db) return "Undefined db in request.";
  if (!cachedDbList.some((item) => item.name === dbRequest.db)) {
    return `Database with the name ${dbRequest.db} does not exist.`;
  }
  return "";
}
