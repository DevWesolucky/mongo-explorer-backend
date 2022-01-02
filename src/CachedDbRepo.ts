import { ListDatabasesResult } from "mongodb";
import { mongoClient } from "./mongo/MongoController";

/**
 * MongoDB does not throw error if database or collection with the name from request
 * does not exist. So preserve data here to don't list databases and collections
 * at evry request (e.g. /api/databases/fake-db/fake-collection/itemId)
 */
export type CachedDatabase = {
    name: string,
    collectionNameList: Array<string>
}
let cachedDbList: Array<CachedDatabase> = [];

/**
 * Getter for pirvate field
 * @returns cachedDbList Array<CachedDatabase>
 */
export function getCachedDbList() {
    return cachedDbList;
}

/**
 * Update chached databases with collection name list to fast validate database/collection exists.
 */
export async function updateCachedDbList() {
    cachedDbList = [];
    const adminDb = mongoClient.db().admin();
    const res: ListDatabasesResult = await adminDb.listDatabases();
    const dbNameList = Array.from(res.databases).map(item => item.name);

    for (const name of dbNameList) {
        const db: CachedDatabase = { name, collectionNameList: [] };
        cachedDbList.push(db);
        const database = mongoClient.db(name);
        const cursor = database.listCollections();
        const itemList = await cursor.toArray();
        db.collectionNameList = itemList.map(item => item.name);
    }
}

