import { query, Request } from "express";
import { DbRequest } from "../src/DbRequest";
import { toDbRequest } from "../src/DbRequestService";
import { DbRequestType } from "../src/DbRequestType";

describe("Express Request to DbRequest", () => {
    it("should return DbRequest with type databases", () => {
        const mockRequest = { path: "/databases" } as Request;
        const dbRequest = toDbRequest(mockRequest);
        expect(dbRequest).toBeInstanceOf(DbRequest);
        expect(dbRequest.type).toBe(DbRequestType.databases);
    })
    it("should return DbRequest with type collections", () => {
        const mockRequest = { path: "/databases/dbName" } as Request;
        const dbRequest = toDbRequest(mockRequest);
        expect(dbRequest.type).toBe(DbRequestType.collections);
        expect(dbRequest.db).toBe("dbName");
    })

    it("should return DbRequest with type items", () => {
        const mockRequest = { path: "/databases/dbName/collectionName" } as Request;
        const dbRequest = toDbRequest(mockRequest);
        expect(dbRequest.type).toBe(DbRequestType.items);
        expect(dbRequest.db).toBe("dbName");
        expect(dbRequest.collection).toBe("collectionName");
    })
    it("should return DbRequest with query with default limit 10 and page 0", () => {
        const mockRequest = { path: "/databases" } as Request;
        const dbRequest = toDbRequest(mockRequest);
        expect(dbRequest.query.limit).toBe(10);
        expect(dbRequest.query.page).toBe(0);
    })
    it("should return DbRequest with empty string as type, invalid base URL", () => {
        const mockRequest = { path: "/invalid/base/url" } as Request;
        const dbRequest = toDbRequest(mockRequest);
        expect(dbRequest.type).toBe("");
    })
    it("should return DbRequest with empty string as type, too much URL parts", () => {
        const mockRequest = { path: "/databases/dbName/collectionName/invalidPart" } as Request;
        const dbRequest = toDbRequest(mockRequest);
        expect(dbRequest.type).toBe("");
    })

})