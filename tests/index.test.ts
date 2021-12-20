import { Request } from "express";
import { DbRequest } from "../src/DbRequest";
import { toDbRequest } from "../src/DbRequestService";
import { DbRequestType } from "../src/DbRequestType";

describe("index", () => {

    it("should return DbRequest with empty string as type", () => {
        const mockRequest = { url: "/fake/url" } as Request;
        const dbRequest = toDbRequest(mockRequest);
        expect(dbRequest).toBeInstanceOf(DbRequest);
        expect(dbRequest.type).toBe("");
    })

    it("should return DbRequest with type databases", () => {
        const mockRequest = { url: "/databases" } as Request;
        const dbRequest = toDbRequest(mockRequest);
        expect(dbRequest.type).toBe(DbRequestType.databases);
    })

    it("should return DbRequest with type collections", () => {
        const mockRequest = { url: "/databases/dbName" } as Request;
        const dbRequest = toDbRequest(mockRequest);
        expect(dbRequest.type).toBe(DbRequestType.collections);
        expect(dbRequest.db).toBe("dbName");
    })

    it("should return DbRequest with type items", () => {
        const mockRequest = { url: "/databases/dbName/collectionName" } as Request;
        const dbRequest = toDbRequest(mockRequest);
        expect(dbRequest.type).toBe(DbRequestType.items);
        expect(dbRequest.db).toBe("dbName");
        expect(dbRequest.collection).toBe("collectionName");
    })

})