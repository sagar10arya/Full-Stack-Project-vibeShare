// require('dotenv').config({path: './env'})    // -->instead of this line we have used
import dotenv from "dotenv"
import connectDB from  "./db/index.js"

dotenv.config({ path: './env'})


connectDB()