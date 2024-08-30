import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) =>
{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens.")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from the frontend 
    // validation - not empty
    // Check if user already exists -> email, username
    // check for images and avatar
    // Upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh tokens field from the response
    // check for user creation
    // return response


    /* get user details from the frontend  */
    const {fullName, email, username, password} = req.body
    // console.log(req.body)    // console.log("Email: ", email)
    
    /*   get user details from the frontend */
    
    // if(fullName === ""){
    //     throw new ApiError(400, "FullName is required")
    // }

    // we can write seperately too to check if each file is empty or not || use some function
    if( [fullName, email, username, password].some( (field) => field?.trim() === "") ){
        throw new ApiError(400, "All fields are mandatory")
    }

    /* Check if user already exists -> email, username */
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    
    if(existedUser) {
        throw new ApiError(409, "User with email or username already exists.")
    }
    
    // console.log(req.files)
    /* check for images and avatar */
    const avatarLocalPath = req.files?.avatar[0]?.path;

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;    // --> Error     
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;  // -> above line errro solved and this will run       
    // coverImageLocalPath can also be checked as following
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required.")
    }

    /* Upload them to cloudinary, avatar */
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage =  await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required.")
    }

    /* create user object - create entry in db */
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    /* remove password and refresh tokens field from the response */

    // .select -> we give which field we don't want to select as all our selected by default
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    /* check for user creation */
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user")
    }   

    /* return response*/
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registerd Successfully.")
    )
})

const loginUser = asyncHandler( async (req, res) => {
    // req body -> data -> username or email
    // find the user
    // password check
    // access and refresh tokens
    // send cookies

    // req body -> data -> username or email
    const {username, email, password} = req.body

    if(!(username || email)){
        throw new ApiError(404, "username or email is required.")
    }

    // find the user
    const user = await User.findOne({
        $or: [{email},{username}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist.")
    }

    // password check
    const isPasswordvalid = user.isPasswordCorrect(password)
    
    if(!isPasswordvalid){
        throw new ApiError(404,"Invaid User Credentials.")
    }

    // access and refresh tokens
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // send cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully."
        )
    )
})

const logoutUser = asyncHandler ( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        { new: true     }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", accessToken, options)
    .clearCookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {},
            "User Logged Out Successfully."
        )
    )
})

export {registerUser, loginUser, logoutUser}