import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400, "Invalid channel id format")
    }

    const subscriberId = req.user._id

    // Check if the channel exists
    const channel = await User.findById(channelId)
    if(!channel){
        throw new ApiError(404, "Channel not found")
    }

    // Check if the user is already subscribed to the channel
    const existingSubscription = await Subscription.findOne({
        subscriber : subscriberId,
        channel : channelId
    })

    let message;
    // If subscription exists, unsubscribe (remove the subscription)
    if(existingSubscription){
        await Subscription.findOneAndDelete({
            subscriber : subscriberId,
            channel : channelId
        })
        message = "Unsubscribed Successfully"
    }
    else{
        // If no subscription exists, subscribe (create a new subscription)
        const newSubscription = await Subscription({
            subscriber : subscriberId,
            channel : channelId
        })
        await newSubscription.save()
        message = "Subscribed Successfully"
    }

    return res
    .status(200)
    .json(new ApiResponse(200, null, message));

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    // Find all subscriptions for the given channel
    const subscriptions = await Subscription.find({channel: channelId})
    .populate('subscriber', 'name email')   // Populate subscriber field with user details
    .exec()    // Execute the query

    if(!subscriptions.length){
        return res
        .status(404)
        .json(new ApiResponse(404,[], "No subscribers"))
    }

    // Extract subscriber information
    const subscribers = subscriptions.map(sub => sub.subscriber)

    return res
    .status(200)
    .json(new ApiResponse(200,subscribers, "Subscribers fetched Successfully")) 
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    // Find all subscriptions for the given subscriber
    const subscriptions = await Subscription.find({subscriber: subscriberId})
    .populate('channel', 'name')
    .exec()

    // Extract channel details from the subscriptions
    const subscribedChannels = subscriptions.map(sub => sub.channel)

    // Return the list of subscribed channels
    return res
    .status(200)
    .json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully."));

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}