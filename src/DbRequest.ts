export class DbRequest {
    public db: string;
    public collection: string;
    public method: string;
    public type: string;
    public data: any;
    public query: any;
    public sort: any;
    public page: number;
    public limit: number;

    constructor(rawObj: any) {
        this.db = rawObj.db ?? "";
        this.collection = rawObj.collection ?? "";
        this.method = rawObj.method ?? "";
        this.type = rawObj.type ?? "";
        this.data = rawObj.data;
        this.query = rawObj.query ?? {};
        this.sort = rawObj.sort ?? {};
        this.page = rawObj.page ?? 0;
        this.limit = rawObj.limit ?? 10;
    }

}