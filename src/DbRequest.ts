export class DbRequest {
    public method: string;
    public url: string;
    public db: string;
    public collection: string;
    public type: string;
    public body: any;
    public query: any;
    public sort: any;

    constructor(rawObj: any) {
        this.method = rawObj.method ?? "";
        this.url = rawObj.url ?? "";
        this.db = rawObj.db ?? "";
        this.collection = rawObj.collection ?? "";
        this.type = rawObj.type ?? "";
        this.body = rawObj.body;

        this.query = rawObj.query ?? {};
        this.sort = rawObj.sort ?? {};
    }

}