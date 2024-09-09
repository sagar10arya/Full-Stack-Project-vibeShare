import mongoose  from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import { Video } from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name || !description){
        throw new ApiError(400, "All fields required")
    }

    const ownerId = req.user._id

    const newPlaylist = new Playlist({
        name,
        description,
        owner: ownerId,
        videos: []
    })

    // Save the playlist to the database
    const savedPlaylist = await newPlaylist.save();

    return res
    .status(200)
    .json(new ApiResponse(200, savedPlaylist, "Playlist Created Successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    // 1. Validate the user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID format.")
    }

    // Debug log to ensure userId is being passed

    // 2. Pagination parameters
    const page = parseInt(req.query.page) || 1  // Default : page 1
    const limit = parseInt(req.query.limit) || 10  // Default : 10 playlists per page

    // 3. Query the database to find playlists by the user
    const playlists = await Playlist.find({owner: userId})
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({createdAt: -1})
    .select("name description videos createdAt")

    const totalPlaylists = await Playlist.countDocuments({ owner: userId })

    const userPlaylists = {
        totalPlaylists,
        currentPage: page,
        totalPages: Math.ceil(totalPlaylists / limit),
        playlists
    }

    return res
    .status(200)
    .json(new ApiResponse(200, userPlaylists, "User Playlist fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID format.");
    }

    const playlist = await Playlist.findById(playlistId)
    .populate("videos", "title description thumbnail")
    .populate("owner", "username")

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID format.");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID format.");
    }

    // Check if the playlist exists
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    // Check if the video exists
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found")
    }

    // Check if the video is already in the playlist
    if(playlist.videos.includes(videoId.toString())){
        throw new ApiError(400, "Video already exists in the playlist")
    }

    // Add the video to the playlist
    playlist.videos.push(videoId);

    // Save the updated playlist
    await playlist.save();

    return res.status(200)
    .json(new ApiResponse(200, playlist, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID format.");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID format.");
    }

    // check if playlist exist
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(400, "Playlist not found");
    }

    // Check if the video exists in the playlist
    const videoExists = playlist.videos.includes(videoId)
    if(!videoExists){
        throw new ApiError(400, "Video not found in the playlist")
    }

    // Remove the video from the playlist
    playlist.videos = playlist.videos.filter( (id) => id.toString() !== videoId)

    await playlist.save();

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video removed from playlist successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    // Validate playlist ID
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID format");
    }

    // check if playlist exist
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(400, "Playlist not found");
    }

    // delete playlist
    await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    // Validate playlist ID
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID format");
    }

    if (!name && !description) {
        throw new ApiError(400, "At least one field (name or description) is required to update.");
    }

    // find the playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if(name) playlist.name = name
    if(description) playlist.name = description

    const updatedPlaylist = await playlist.save();

    return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}