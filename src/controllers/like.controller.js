import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import {Comment} from '../models/comment.model.js'
import {Tweet} from '../models/tweet.model.js'
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video id format")
    }

    const userId = req.user._id

    // Check if the video exists
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found")
    }

    // Check if the user has already liked the video
    const existingLike = await Like.findOne({video: videoId , likedBy: userId})
    if(existingLike){
        // If the like exists, remove it (unlike the video)
        await Like.deleteOne({_id: existingLike._id})
        return res
        .status(200)
        .json(new ApiResponse(200, {liked: false}, "Video unliked successfully"))
    }
    else{
        //  If the like doesn't exist, add a new like
        const newLike = new Like({video: videoId, likedBy: userId})
        await newLike.save()
        return res
        .status(200)
        .json(new ApiResponse(200, {liked: true}, "Video liked successfully"))
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user._id

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400, "Invalid video id format")
    }

    // check does comment exists
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404, "Comment not found")
    }

    // Check if the user has already liked the comment
    const existingLike = await Like.findOne({comment: commentId, likedBy: userId})
    if(existingLike){
        // If the like exists, remove it (unlike the video)
        await Like.deleteOne({_id: existingLike._id})
        return res
        .status(200)
        .json(new ApiResponse(200, {liked: false}, "Comment unliked successfully"))
    }
    else{
        //  If the like doesn't exist, add a new like
        const newLike = new Like({comment: commentId, likedBy: userId})
        await newLike.save()
        return res
        .status(200)
        .json(new ApiResponse(200, {liked: true}, "Comment liked successfully"))
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user._id

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400, "Invalid tweet id format")
    }

    // check does tweet exists
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }

    // Check if the user has already liked the comment
    const existingLike = await Like.findOne({tweet: tweetId, likedBy: userId})
    if(existingLike){
        // If the like exists, remove it (unlike the tweet)
        await Like.deleteOne({_id: existingLike._id})
        return res
        .status(200)
        .json(new ApiResponse(200, {liked: false}, "Tweet unliked successfully"))
    }
    else{
        //  If the like doesn't exist, add a new like
        const newLike = new Like({tweet: tweetId, likedBy: userId})
        await newLike.save()
        return res
        .status(200)
        .json(new ApiResponse(200, {liked: true}, "Tweet liked successfully"))
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id

    // Pagination parameters (optional)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Query the database for liked videos by the user
    const likedVideos = await Like.find({ likedBy: userId, video: { $exists: true } })
    .populate('video', 'title description views thumbnail createdAt')  // Populate video info
    .skip((page - 1) * limit)
    .limit(limit);

    const totalLikedVideos = await Like.countDocuments({likedBy: userId, video: { $exists: true}})

    const response = {
        totalLikedVideos,
        currentPage: page,
        totalPages: Math.ceil(totalLikedVideos/limit),
        likedVideos: likedVideos.map(like => like.video)
    }

    return res
    .status(200)
    .json(new ApiResponse(200, response, "Liked videos fetched successfully"));

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}