import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import { User } from "../models/user.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {

    const { channelId  } = req.params
    
    // 1. Validate channel ID format
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400, "Invalid Video ID format")
    }

    // 2. Find the user (channel owner) by ID
    const channelOwner = await User.findById(channelId)
    if(!channelOwner){
        throw new ApiError(404, "Channel not found")
    }
    // console.log(channelOwner);
    // 3. Aggregation for total views, likes, and videos
    const stats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: "$owner",
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                
            }
        }
    ]);

    // 4. Get total likes using the Like model
    const totalLikes = await Like.countDocuments({
        video: {
            $in: (await Video.find({owner: channelId}))
        }
    })

    const totalSubscribers = await Subscription.countDocuments({
        channel: new mongoose.Types.ObjectId(channelId)
    })

    const channelStats = {
        totalVideos: stats[0]?.totalVideos || 0,
        totalLikes: totalLikes || 0,
        totalViews: stats[0]?.totalViews || 0,
        totalSubscribers
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channelStats, "Channel Stats fetched Successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    // 1. Validate channel ID format
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400, "Invalid channel ID format")
    }

    // 2. Find the user (channel owner) by ID
    const channelOwner = await User.findById(channelId)
    if(!channelOwner){
        throw new ApiError(404, "Channel does not exist")
    }

    // 3. Pagination parameters
    const page = parseInt(req.query.page) || 1  // default to page 1
    const limit = parseInt(req.query.limit) || 10  // default to 10 videos/page

    // 4. Query the database to find videos owned by this channel
    const videos = await Video.find({ owner: channelId})
    .skip((page-1) * limit)
    .limit(limit)
    .sort({ createdAt: -1}) // newest first
    .select("title description views thumbnail createdAt")

    // Calculate total number of videos
    const totalVideos = await Video.countDocuments({ owner: channelId });

    const response = {
        totalVideos,
        currentPage: page,
        totalPages: Math.ceil(totalVideos / limit),
        videos
    }

    return res.status(200)
    .json(new ApiResponse(200, response, "Channel Videos fetched Successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }