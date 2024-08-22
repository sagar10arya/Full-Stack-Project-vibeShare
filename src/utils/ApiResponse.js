// class that defines the structure for an API response
class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode    // Stores the provided HTTP status code
        this.data = data                // Stores the data to be returned in the response
        this.message = message          // Stores the provided message or the default "Success"
        this.success = statusCode < 400
    }
}