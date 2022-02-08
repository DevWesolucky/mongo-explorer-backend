// npm run test "./tests/mongo/DatabasesService.test.ts"
import { CachedDatabase, getCachedDbList } from "../../src/CachedDbRepo";
import { DbRequest } from "../../src/DbRequest";
import { DbRequestType } from "../../src/DbRequestType";
import { handleDatabasesRequest, validateNewDatabase, validateRequestDatabaseExists } from "../../src/mongo/DatabasesService";
import { closeMongoConnection, handleMongoDbRequest, initMongoConnection, mongoClient } from "../../src/mongo/MongoController"

const DB_NAME = "test-database";

beforeAll(async () => {
    await initMongoConnection(process.env.MONGO_URI ?? "mongodb://localhost:27017");
})

afterAll(async () => {
    // clean up test data > delete test db
    const testDbNameList = [DB_NAME, "test"];
    for (let dbName of testDbNameList) {
        if (!getCachedDbList().some(item => item.name === dbName)) continue;
        const dbRequest = new DbRequest({ type: DbRequestType.databases, method: "DELETE" });
        dbRequest.body = { name: dbName };
        const dbResult = await handleMongoDbRequest(dbRequest);
        if (dbResult.errorMessage) console.error("afterAll > error: ", dbResult.errorMessage);
    }
    return closeMongoConnection();
})

describe(("handleDatabasesRequest"), () => {

    /**
     * Mongo driver (or engine) quirk
     * Empty database could not be created, collection required (hardcoded 'temp.start' collection added)
     */
    it(("should create new db"), async () => {
        const dbRequest = new DbRequest({ type: DbRequestType.databases, method: "POST" });
        dbRequest.body = { name: DB_NAME };
        const dbResult = await handleDatabasesRequest(dbRequest);
        expect(dbResult.errorMessage).toBe("");
        expect(getCachedDbList().some(item => item.name === DB_NAME)).toBe(true);
    })

    /**
     * Mongo driver (or engine) quirk
     * undefined name for a new databese does not throw error, database with 'test' name will be created
     */
    it(("should create a new db even if the name of new db is undefined"), async () => {
        const dbRequest = new DbRequest({ type: DbRequestType.databases, method: "POST" });
        dbRequest.body = {};
        const dbResult = await handleDatabasesRequest(dbRequest);
        expect(dbResult.errorMessage).toBe("");
        expect(getCachedDbList().some(item => item.name === "test")).toBe(true);
    })

    it(("should return error message, invalid type of name for new db"), async () => {
        const dbRequest = new DbRequest({ type: DbRequestType.databases, method: "POST" });
        dbRequest.body = { name: { info: "invalid type of name for new db" } };
        const dbResult = await handleDatabasesRequest(dbRequest);
        expect(dbResult.errorMessage).toBe("Database name must be a string");
    })

})


/*
describe("validateNewDatabase", () => {
    it("should return empty string as validation success", () => {
        const dbRequest = new DbRequest({ body: { name: "db.one" } });
        const cachedDbList: Array<CachedDatabase> = [];
        const validationResult = validateNewDatabase(dbRequest, cachedDbList);
        expect(validationResult).toBe("");
    })
    it("should return error message, db name should be a string", () => {
        const validationResult = validateNewDatabase(new DbRequest({}));
        expect(validationResult).toBe("Name for db in request body should be a non empty string.");
    })
    it("should return error message, db with the name already exists", () => {
        const dbRequest = new DbRequest({ body: { name: "db.one" } });
        const cachedDbList: Array<CachedDatabase> = [{ name: "db.one", collectionNameList: [] }];
        const validationResult = validateNewDatabase(dbRequest, cachedDbList);
        expect(validationResult).toBe(`Database with the name '${dbRequest.body.name}' already exists.`);
    })
})

describe("validateRequestDatabaseExists", () => {
    it("should return empty string as validation success", () => {
        const dbRequest = new DbRequest({ db: "db.one" });
        const cachedDbList: Array<CachedDatabase> = [{ name: "db.one", collectionNameList: [] }];
        const validationResult = validateRequestDatabaseExists(dbRequest, cachedDbList);
        expect(validationResult).toBe(``);
    })
    it("should return error message, undefined db in request", () => {
        const validationResult = validateRequestDatabaseExists(new DbRequest({}), []);
        expect(validationResult).toBe(`Undefined db in request.`);
    })
    it("should return error message, db with the name does not exist", () => {
        const dbRequest = new DbRequest({ db: "db.one" });
        const cachedDbList: Array<CachedDatabase> = [{ name: "db.two", collectionNameList: [] }];
        const validationResult = validateRequestDatabaseExists(dbRequest, cachedDbList);
        expect(validationResult).toBe(`Database with the name ${dbRequest.db} does not exist.`);
    })
})

//*/