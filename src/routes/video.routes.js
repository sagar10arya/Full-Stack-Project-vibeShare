import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {    
        getAllVideos,
        publishAVideo,
        getVideoById,
        updateVideo,
        deleteVideo,
        togglePublishStatus
    } from "../controllers/video.controller.js"

const router = Router()

// Route to get all videos with query parameters
router.route("/videos").get(getAllVideos);

// Route to publish a new video (POST request to create)
router.route("/publish-video").post(verifyJWT, publishAVideo);

// Route to get a video by its ID
router.route("/videos/:videoId").get(getVideoById);

// Route to update a video by its ID
router.route("/videos/:videoId").patch(verifyJWT, updateVideo);

// Route to delete a video by its ID
router.route("/videos/:videoId").delete(verifyJWT, deleteVideo);

// Route to toggle the publication status of a video
router.patch('/videos/:videoId/toggle-status', verifyJWT, togglePublishStatus);

export default router;
