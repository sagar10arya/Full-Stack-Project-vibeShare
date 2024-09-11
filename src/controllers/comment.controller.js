import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    // get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    // validate the video ID format
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID format")
    }

    // find the video to ensure it exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // query to find all comments related to the video with pagination
    const comments = await Comment.find({ video: videoId })
    .skip((page - 1) * limit)  // Skip items for previous pages
    .limit(parseInt(limit))     // Limit the number of results per page
    .sort({ createdAt: -1 })    // Sort comments by the newest first
    .populate('owner', 'name email')  // Populate owner details for each comment
    .exec()

    // Get the total count of comments for the video
    const totalComments = await Comment.countDocuments({ video: videoId })

    const response = {
        totalComments,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComments / limit),
        comments
    }

    return res
    .status(200)
    .json(new ApiResponse(200, response, "Video comments fetched successfully"));
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body;
    const userId = req.user._id

    // Validate the video ID format
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID format");
    }

    // Find the video by ID to ensure it exists
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Validate comment content
    if (!content || content.trim().length == 0) {
        throw new ApiError(400, "Comment content cannot be empty");
    }

    // Create a new comment
    const newComment = new Comment({
        content,
        video: videoId,
        owner: userId   // The user who created the comment
    })

    const savedComment = await newComment.save()

    return res
    .status(200)
    .json(new ApiResponse(200, savedComment, "Comemnt added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params  // Extract comment ID from the request parameters
    const { content } = req.body     // Extract updated content from the request body
    const userId = req.user._id

    // Validate the comment ID format
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID format")
    }

    // Find the comment by ID
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    // Check if the user is the owner of the comment
    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment")
    }

    // Validate the new content
    if (!content || content.trim().length === 0) {
        throw new ApiError(400, "Comment content cannot be empty")
    }

    // Update the comment content
    comment.content = content

    // save the updated comment to the database
    const updatedComment = await comment.save()

    return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user._id

    // validate the comment ID format
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID format")
    }

    // find the comment by ID
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    // check if the user is the owner of the comment or has admin rights
    if (comment.owner.toString() !== userId.toString() && !req.user.isAdmin) {
        throw new ApiError(403, "You are not authorized to delete this comment")
    }

    // delete the comment
    await comment.deleteOne()

    return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }