import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (_, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    // A health check endpoint is commonly used in web applications to verify that the application is running and can respond to requests

    return res.status(200)
    .json(new ApiResponse(200, "Service is Healthy"))
})

export {
    healthcheck
    }
    