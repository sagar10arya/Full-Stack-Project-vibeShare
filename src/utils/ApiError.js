/* 
ApiError class is a custom error class in JavaScript that extends the built-in Error class.
It's designed to handle and represent errors in an API context, providing more structured information like a status code, error messages, and an optional list of specific errors. 
*/
class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode;        // Sets the HTTP status code
        this.data = null;  // Initializes with null, could be used to store additional data related to the error if needed
        this.message = message;              // Stores the error message
        this.success = false;               //A boolean flag indicating that the operation was unsuccessful
        this.errors = errors;               // Stores the array of specific error details

        // Handling the Stack Trace
        if(stack){
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}