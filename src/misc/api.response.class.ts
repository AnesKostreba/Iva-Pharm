export class ApiResponse{
    errorCode: string;
    statusCode: number;
    message: string | null;

    constructor(errorCode: string, statusCode: number, message: string | null = null){
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.message = message
    }
}