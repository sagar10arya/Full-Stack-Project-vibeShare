import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import { ApiError } from './ApiError.js';
import { ApiResponse } from './ApiResponse.js';

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto"})
        // File has been uploaded successfully
        // console.log("File has been Uploaded Successfully", response.url);
        // console.log("Response: ", response);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return new ApiError(400, error, "Error uploading file to Cloudinary")
    }
}

const deleteFromCloudinary = async (videoId) => {
    try {
        if (!videoId) {
            throw new Error("Public ID is required for deletion");
        }

        const response = await cloudinary.uploader.destroy(videoId, { resource_type: "auto"})
        
        return response
        .status(200)
        .json(new ApiResponse(200, response, "File deleted successfully"))

        
    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        return new ApiError(400, error, "Error deleting file from Cloudinary")
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}