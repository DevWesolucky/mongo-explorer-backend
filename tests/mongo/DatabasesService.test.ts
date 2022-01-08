import { CachedDatabase } from "../../src/CachedDbRepo";
import { DbRequest } from "../../src/DbRequest";
import { validateNewDatabase, validateDatabaseExists } from "../../src/mongo/DatabasesService";


describe("validateNewDatabase", () => {
    it("should return empty string as validation success", () => {
        const dbRequest = new DbRequest({ body: { name: "db.one" } });
        const cachedDbList: Array<CachedDatabase> = [];
        const validationResult = validateNewDatabase(dbRequest, cachedDbList);
        expect(validationResult).toBe("");
    })
    it("should return error message, db name should be a string", () => {
        const validationResult = validateNewDatabase(new DbRequest({}));
        expect(validationResult).toBe("Name for new db in request body should be a non empty string.");
    })
    it("should return error message, db with the name already exists", () => {
        const dbRequest = new DbRequest({ body: { name: "db.one" } });
        const cachedDbList: Array<CachedDatabase> = [{ name: "db.one", collectionNameList: [] }];
        const validationResult = validateNewDatabase(dbRequest, cachedDbList);
        expect(validationResult).toBe(`Database with the name '${dbRequest.body.name}' already exists.`);
    })
})

describe("validateDatabaseExists", () => {
    it("should return empty string as validation success", () => {
        const dbRequest = new DbRequest({ db: "db.one" });
        const cachedDbList: Array<CachedDatabase> = [{ name: "db.one", collectionNameList: [] }];
        const validationResult = validateDatabaseExists(dbRequest, cachedDbList);
        expect(validationResult).toBe(``);
    })
    it("should return error message, undefined db in request", () => {
        const validationResult = validateDatabaseExists(new DbRequest({}), []);
        expect(validationResult).toBe(`Undefined db in request.`);
    })
    it("should return error message, db with the name does not exist", () => {
        const dbRequest = new DbRequest({ db: "db.one" });
        const cachedDbList: Array<CachedDatabase> = [{ name: "db.two", collectionNameList: [] }];
        const validationResult = validateDatabaseExists(dbRequest, cachedDbList);
        expect(validationResult).toBe(`Database with the name ${dbRequest.db} does not exist.`);
    })
})