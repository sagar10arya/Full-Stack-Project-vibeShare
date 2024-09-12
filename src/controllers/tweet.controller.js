import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body

    if(!content || content.trim().length == 0){
        throw new ApiError(400, "Tweet can not be empty")
    }

    const userId = req.user._id

    // Create a new tweet
    const newTweet = new Tweet({
        content,
        owner: userId
    })

    const savedTweet = await newTweet.save()

    return res
    .status(200)
    .json(new ApiResponse(200, savedTweet, "Tweet added successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params

    // validate the user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID format")
    }

    // pagination parameters
    const page = parseInt(req.query.page) || 1        // default to page 1
    const limit = parseInt(req.query.limit) || 10    // default to 10 tweets per page

    // Query the database to find tweets by the user
    const tweets = await Tweet.find({ owner: userId })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 })  // newest tweets first
    .select('content createdAt')

    // get the total count of tweets for the user
    const totalTweets = await Tweet.countDocuments({ owner: userId })

    const userTweets = {
        totalTweets,
        currentPage: page,
        totalPages: Math.ceil(totalTweets / limit),
        tweets
    }

    return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "User tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    const {tweetId} = req.params

    if(!content || content.trim().length == 0){
        throw new ApiError(400, "Tweet can not be empty")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    // check if the current user is the owner of the tweet
    if(tweet.owner.toString() !== req.user._id.toString()){
    throw new ApiError(403, "You are not authorized to update this tweet");
    }
    
    // updating tweet
    tweet.content = content

    const updatedTweet = await tweet.save()

    return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    // check if the current user is the owner of the tweet
    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    await tweet.deleteOne()    // Delete

    return res
    .status(200)
    .json(new ApiResponse(200, null, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}