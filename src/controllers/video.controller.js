import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    // Validate required fields
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required.");
    }

    // Check if a video file was uploaded and get its local path
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    if(!videoFileLocalPath){
        throw new ApiError(400, "Video is required")
    }

    // Upload the video to Cloudinary
    const videoFileUpload = await uploadOnCloudinary(videoFileLocalPath, {
        resource_type: 'video',
        folder: 'videos',
        eager: [  { width: 300, crop: "scale", format: "jpg" } ]    // Example transformation to create a thumbnail 
    })
    /*After applying this eager transformation, Cloudinary will return an array of transformed resources in 
    videoFileUpload.eager. The secure_url of the first item in this array is typically the thumbnail. */

    if(!videoFileUpload){
        throw new ApiError(400, "Failed to upload video.")
    }

    // Thumbnail
    const thumbnailUrl = videoFileUpload.eager?.[0]?.secure_url || videoFileUpload.secure_url; 

    // Prepare the video data for saving to the database
    const videoUpload = await Video.create({
        title,
        description,
        videoFile: videoFile.secure_url,
        thumbnail: thumbnailUrl,
        duration: videoFile.duration,   // Cloudinary should return the duration in seconds
        owner: req.user._id
    })

    if(!videoUpload){
        throw new ApiError(500, "Failed to save video details to the database.")
    }

    // deletes the local video file           ( check )
    const fs = require('fs');
    fs.unlink(videoFileLocalPath, (err) => {
        if (err) console.error('Failed to delete local file:', err);
    });

    return res
    .status(200)
    .json(new ApiResponse(201, videoUpload, "Video Uploaded Successfully."))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // Validate the videoId format
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        return next(new ApiError(400, "Invalid Video ID format"));
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video Id dosen't exist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}