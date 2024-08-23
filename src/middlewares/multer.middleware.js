import multer from "multer";
/*
basic file upload mechanism using multer. Uploaded files will be stored in the ./public/temp directory with their original filenames. 
*/
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb){
    // Note: You can customize the file name, for example, by adding a unique suffix like a timestamp or a UUID to avoid name collisions.
        cb(null, file.originalname);
    }
})

export const upload = multer({
    storage,
})