import { MongoClient } from "mongodb";
import { DbRequest } from "./DbRequest";
import { DbResult } from "./DbResult";
import { DeleteService } from "./service/DeleteService";
import { GetService } from "./service/GetService";
import { PatchService } from "./service/PatchService";
import { PostService } from "./service/PostService";

enum ConnectionState { DISCONNECTED = "DISCONNECTED", CONNECTED = "CONNECTED" }

export class MongoController {
    public state: string;
    private mongoClient: MongoClient;

    private getService: GetService;
    private postService: PostService;
    private patchService: PatchService;
    private deleteService: DeleteService;

    constructor() {
        this.state = ConnectionState.DISCONNECTED;
        this.mongoClient = new MongoClient(process.env.MONGO_URI ?? "mongodb://localhost:27017");
        /*
        // not fires when mongo container stops (only open at start)
        this.mongoClient.addListener("open", () => { console.log("open event") });
        this.mongoClient.addListener("close", () => { console.log("close event") });
        this.mongoClient.on("close", () => { console.log("close event") });
        //*/
        this.getService = new GetService(this.mongoClient);
        this.postService = new PostService(this.mongoClient);
        this.patchService = new PatchService(this.mongoClient);
        this.deleteService = new DeleteService(this.mongoClient);
        this.connect();
    }

    public async handleRequest(req: any): Promise<DbResult> {
        if (this.state !== ConnectionState.CONNECTED) return new DbResult("Can't connect to db.");
        const dbRequest = new DbRequest(req);
        if (!dbRequest.method) return new DbResult("Undefined method.");
        switch (dbRequest.method) {
            case "POST":
                return await this.postService.handleRequest(dbRequest);
            case "GET":
                return await this.getService.handleRequest(dbRequest);
            case "PATCH":
                return await this.patchService.handleRequest(dbRequest);
            case "DELETE":
                return await this.deleteService.handleRequest(dbRequest);
            default:
                return new DbResult(`Unsupported method: ${dbRequest.method}`);
        }
    }
    
    private async connect() {
        console.log(`MongoClient connecting....`);
        await this.mongoClient.connect()
            .then(() => {
                this.state = ConnectionState.CONNECTED;
            })
            .catch((e: Error) => {
                console.error(`MongoController.connect > error message: `, e.message);
            });
        console.log(`MongoClient state: ${this.state}`);
        if (this.state !== ConnectionState.CONNECTED) setTimeout(() => this.connect, 30000);
    }


}
