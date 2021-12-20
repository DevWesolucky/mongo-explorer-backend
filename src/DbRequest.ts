export class DbRequest {
    public method: string;
    public url: string;
    public db: string;
    public collection: string;
    public type: string;
    public body: any;
    public query: any;
    public sort: any;
    public page: number;
    public limit: number;

    constructor(rawObj: any) {
        this.method = rawObj.method ?? "";
        this.url = rawObj.url ?? "";
        this.db = rawObj.db ?? "";
        this.collection = rawObj.collection ?? "";
        this.type = rawObj.type ?? "";
        this.body = rawObj.body;
        this.query = rawObj.query ?? {};
        this.sort = rawObj.sort ?? {};
        this.page = rawObj.page ?? 0;
        this.limit = rawObj.limit ?? 10;
    }

}