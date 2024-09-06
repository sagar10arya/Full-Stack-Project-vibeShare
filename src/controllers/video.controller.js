import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    // const { page = 1, limit = 10, query='', sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    // Extract query parameters with defaults
    const { 
        page = 1,               // Current page number for pagination (default: 1)
        limit = 10,             // Number of results per page (default: 10)
        query = '',             // Search query for title or description (default: empty string)
        sortBy = 'createdAt',  // Field to sort by (default: createdAt)
        sortType = 'desc',     // Sort order, 'asc' for ascending and 'desc' for descending (default: desc)
        userId                  // Optional userId to filter videos by owner
    } = req.query;

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
        throw new ApiError(400, "Page and limit must be greater than 0");
    }

    // Validate sortBy field
    const validSortFields = ['createdAt', 'title', 'views', 'duration'];
    if (!validSortFields.includes(sortBy)) {
        throw new ApiError(400, "Invalid sort field");
    }

    // Convert page and limit to integers
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: {
            [sortBy]: sortType === 'asc' ? 1 : -1 // Sort order based on sortType
        }
    };

    // Initialize aggregation pipeline
    const aggregatePipeline = [];

    // Filter by userId if provided
    if (userId) {
        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(400, "Invalid User ID format");
        }
        // Add match stage to filter videos by owner
        aggregatePipeline.push({ 
            $match: { 
                owner: mongoose.Types.ObjectId(userId) 
            } 
        });
    }

    // Add match stage for search query
    if (query) {
        aggregatePipeline.push({
            $match: {
                $or: [
                    { title: { $regex: query, $options: 'i' } },   // Case-insensitive regex search for title
                    { description: { $regex: query, $options: 'i' } } // Case-insensitive regex search for description
                ]
            }
        });
    }

    // Add sorting stage
    aggregatePipeline.push({
        $sort: {
            [sortBy]: sortType === 'asc' ? 1 : -1 // Sort order based on sortType, 1->asc, -1->desc
        }
    })

    // Add pagination stage
    aggregatePipeline.push({
        $facet: {
            metadata: [
                { $count: "totalCount" } // Count total number of documents
            ],
            data: [
                { $skip: (options.page - 1) * options.limit }, // Skip documents for the current page
                { $limit: options.limit } // Limit the number of documents returned
            ]
        }
    })

    // Execute aggregation pipeline
    const result = await Video.aggregate(aggregatePipeline);

    // Extract total count and data from the result
    const totalCount = result[0].metadata[0]?.totalCount || 0;
    const videos = result[0].data;

    const getAllVideoDetails = {
        totalCount,                  // Total number of documents matching the query
        page: options.page,         // Current page number
        limit: options.limit,       // Number of results per page
        totalPages: Math.ceil(totalCount / options.limit), // Total number of pages
        videos                       // List of videos for the current page
    }

    return res
    .status(200)
    .json(new ApiResponse(200, getAllVideoDetails, "Get All Videos Successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {

    const { title, description} = req.body

    // Validate required fields
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required.");
    }

    // Check if a video file was uploaded
    if (!req.file || !req.file.path) {
        throw new ApiError(400, 'Video file is required.');
    }

    // Check if a video file was uploaded and get its local path
    const videoFileLocalPath = req.file.path

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
    // console.log("Thumbnail: ",thumbnailUrl);

    // Prepare the video data for saving to the database
    const videoUpload = await Video.create({
        title,
        description,
        videoFile: videoFileUpload.secure_url,
        thumbnail: thumbnailUrl,
        duration: videoFileUpload.duration,   // Cloudinary should return the duration in seconds
        views: 0,
        owner: req.user._id
    })

    if(!videoUpload){
        throw new ApiError(500, "Failed to save video details to the database.")
    }

    // deletes the local video file
    // const fs = require('fs');
    // fs.unlink(videoFileLocalPath, (err) => {
    //     if (err) console.error('Failed to delete local file:', err);
    // });

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

    const {title, description, thumbnail} = req.body

    // Validate the videoId format
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video Id format")
    }

    if(!title && !description && !thumbnail){
        throw new ApiError(400, "All fields required.")
    }

    // Created an object with only the fields that need to be updated
    const updateFields = {}
    if(title) updateFields.title = title
    if(description) updateFields.description = description
    if(thumbnail) updateFields.thumbnail = thumbnail


    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {   
            $set: updateFields
            // $set: {
            //     title,
            //     description,
            //     thumbnail
            // },
        },
          { new: true } // return updated information
    )

    if(!updatedVideo){
        throw new ApiError(404, "Video not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video Updated Successfully."))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
        
    // Validate the videoId format
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid Video ID format")
    }

    //  Extract video ID from the video URL
    const getCloudinaryPublicId = (url) => {
        const parts = url.split('/');
        const fileWithExtension = parts[parts.length - 1];
        const publicId = fileWithExtension.substring(0, fileWithExtension.lastIndexOf('.'));
        return publicId;
    };

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }
    
    // Delete the video document from the database
    const deletedVideo = await Video.findByIdAndDelete(videoId)
    if(!deletedVideo){
        throw new ApiError(500, "Error occurred while deleting video from database")
    }

    // Delete the video file from Cloudinary
    const cloudinaryResult = await deleteFromCloudinary(getCloudinaryPublicId(video.videoFile))

    if (!cloudinaryResult.success) {
        throw new ApiError(500, "Failed to delete video from Cloudinary");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video Deleted SuccssFully"))

})


// Controller to toggle the publication status of a video
const togglePublishStatus = asyncHandler(async (req, res) => {
    // const { videoId } = req.params
    const {videoId} = req.params.id

    console.log(`Received request to toggle status for video ID: ${videoId}`);

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // toggle the isPublished Status
    video.isPublished = !video.isPublished

    // Save the updated video document
    const updatedVideo = await video.save();

    // Log the status change
    console.log(`Video ID ${videoId} publish status toggled to ${updatedVideo.isPublished}`);

    return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video status toggled successfully"));
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}