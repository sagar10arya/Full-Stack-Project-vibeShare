import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
import {    
        getAllVideos,
        publishAVideo,
        getVideoById,
        updateVideo,
        deleteVideo,
        togglePublishStatus
    } from "../controllers/video.controller.js"

const router = Router()

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file


/*   TODO ==> changes to be made   */

// Publishing A video
router.route("/publish-video").post(upload.single("videoFile"), publishAVideo);

// Other Routes

// Route to get all videos with query parameters
router.route("/all-videos").get(getAllVideos);

// Route to get a video by its ID
router.route("/c/:videoId").get(getVideoById);

// Route to update a video by its ID
router.route("/update-video/:videoId").patch(updateVideo);

// Route to delete a video by its ID
router.route("/delete-video/:videoId").delete(deleteVideo);

// Route to toggle the publication status of a video
router.route("/toggle-status/:videoId").patch(togglePublishStatus);

export default router;
