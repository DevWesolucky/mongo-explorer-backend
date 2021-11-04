export class DbResult {
    errorMessage: string = "";
    data: any;

    constructor(errorMessage: string = "", data?: any) {
        this.errorMessage = errorMessage;
        this.data = data;
    }
}