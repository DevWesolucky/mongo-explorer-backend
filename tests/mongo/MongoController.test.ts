// npm run test "./tests/mongo/MongoController.test.ts"
import { Request } from "express";
import { getCachedDbList } from "../../src/CachedDbRepo";
import { DbRequest } from "../../src/DbRequest";
import { toDbRequest } from "../../src/DbRequestService";
import { DbRequestType } from "../../src/DbRequestType";
import { closeMongoConnection, handleMongoDbRequest, initMongoConnection, mongoClient } from "../../src/mongo/MongoController"

const DB_NAME = "test-database";
const COLLECTION_NAME = "test-collection";
const ITEM = { id: 1, role: "USER", name: "Ania" };

beforeAll(async () => {
    await initMongoConnection(process.env.MONGO_URI ?? "mongodb://localhost:27017");
})

afterAll(async () => {
    // delete test db
    const cachedDbList = getCachedDbList();
    const testDb = cachedDbList.find(item => item.name === DB_NAME);
    if (testDb) {
        const mockExpressRequest = { path: "/databases", method: "DELETE" } as Request;
        const dbRequest = toDbRequest(mockExpressRequest);
        dbRequest.body = { name: DB_NAME };
        const dbResult = await handleMongoDbRequest(dbRequest);
        if (dbResult.errorMessage) console.error("afterAll > error: ", dbResult.errorMessage);
    }
    mongoClient.removeAllListeners();
    return closeMongoConnection();
})

describe("MongoController", () => {

    it("should create database", async () => {
        const mockExpressRequest = { path: "/databases", method: "POST" } as Request;
        const dbRequest: DbRequest = toDbRequest(mockExpressRequest);
        expect(dbRequest.type).toBe(DbRequestType.databases);
        dbRequest.body = { name: DB_NAME };

        const dbResult = await handleMongoDbRequest(dbRequest);
        expect(dbResult.errorMessage).toBe("");
        expect(getCachedDbList().some(item => item.name === DB_NAME)).toBe(true);
    })

    it("should create collection", async () => {
        const mockExpressRequest = { path: `/databases/${DB_NAME}`, method: "POST" } as Request;
        const dbRequest = toDbRequest(mockExpressRequest);
        dbRequest.body = { name: COLLECTION_NAME };

        const dbResult = await handleMongoDbRequest(dbRequest);
        expect(dbResult.errorMessage).toBe("");
        const cachedDbList = getCachedDbList();
        const cachedDb = cachedDbList.find(item => item.name === DB_NAME);
        expect(cachedDb).toBeTruthy();
        expect(cachedDb.collectionNameList.some(item => item === COLLECTION_NAME)).toBe(true);
    })

    it("should create item", async () => {
        const mockExpressRequest = { path: `/databases/${DB_NAME}/${COLLECTION_NAME}`, method: "POST" } as Request;
        const dbRequest = toDbRequest(mockExpressRequest);
        dbRequest.body = JSON.parse(JSON.stringify(ITEM));

        const dbResult = await handleMongoDbRequest(dbRequest);
        expect(dbResult.errorMessage).toBe("");
    })

    it("created item should exists in collection", async () => {
        const mockExpressRequest = { path: `/databases/${DB_NAME}/${COLLECTION_NAME}`, method: "GET" } as Request;
        const dbRequest = toDbRequest(mockExpressRequest);
        const dbResult = await handleMongoDbRequest(dbRequest);
        expect(dbResult.data.itemList.some(item => item.name === ITEM.name)).toBe(true);
    })

    it("should add/create item list", async () => {
        const mockExpressRequest = { path: `/databases/${DB_NAME}/${COLLECTION_NAME}`, method: "POST" } as Request;
        const dbRequest = toDbRequest(mockExpressRequest);
        dbRequest.body = [{ id: 2, name: "Bodzio" }, { id: 3, name: "Czesio" }];

        const dbResult = await handleMongoDbRequest(dbRequest);
        expect(dbResult.errorMessage).toBe("");
    })

    // with empty query, update first item in collection
    it("should return error message for update without query parameters", async () => {
        const mockExpressRequest = {
            path: `/databases/${DB_NAME}/${COLLECTION_NAME}`,
            method: "PATCH"
        } as Request;
        const dbRequest = toDbRequest(mockExpressRequest);
        dbRequest.body = { name: "Darek" };
        const dbResult = await handleMongoDbRequest(dbRequest);
        expect(dbResult.errorMessage).toBe("Undefined query parameters for update item.");
    })

    it("should update item in collection", async () => {
        const mockExpressRequest = {
            path: `/databases/${DB_NAME}/${COLLECTION_NAME}`,
            method: "PATCH"
        } as Request;
        const dbRequest = toDbRequest(mockExpressRequest);
        // mock query from parsed by express url (with ending /?id=2)
        dbRequest.query = { id: 2 };
        dbRequest.body = { name: "Darek" };
        const dbResult = await handleMongoDbRequest(dbRequest);
        expect(dbResult.errorMessage).toBe("");
    })

    it("updated item should exists in collection", async () => {
        const mockExpressRequest = { path: `/databases/${DB_NAME}/${COLLECTION_NAME}`, method: "GET" } as Request;
        const dbRequest = toDbRequest(mockExpressRequest);
        const dbResult = await handleMongoDbRequest(dbRequest);
        console.log("dbResult.data:", dbResult.data);

        expect(dbResult.data.itemList.some(item => item.name === "Bodzio")).toBe(true);
    })


})