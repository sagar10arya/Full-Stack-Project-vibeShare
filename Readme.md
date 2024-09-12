# Full Stack Project - vibeShare (a video platform)
#### Completed backend and working on frontend part

# 📽️ Video Platform Backend

This project's backend API for a video platform where users can upload, manage videos, subscribe to channels, create playlists, and engage with content through likes, comments, and tweets.

## 🚀 Features

- User authentication (JWT-based)
- Video upload, update, and management
- Subscription to channels
- Playlists creation and management
- Like, comment, and tweet functionality on videos and tweets
- Comprehensive pagination for videos, playlists, and more
- Aggregated statistics for channels

## 🛠️ Technologies

- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose** ORM
- **JWT** for authentication and authorization
- **Multer** for file uploads (e.g., videos, thumbnails)
- **Cloud storage integration** (optional for video and thumbnail)

## 📂 API Endpoints

### User Routes

- **POST /api/v1/users/register**
  - Register a new user (with avatar and cover image upload)
  
- **POST /api/v1/users/login**
  - Log in a user
  
- **POST /api/v1/users/logout**
  - Log out the current user (JWT required)
  
- **POST /api/v1/users/refresh-token**
  - Refresh the access token
  
- **POST /api/v1/users/change-password**
  - Change the current user's password (JWT required)
  
- **GET /api/v1/users/current-user**
  - Get the current user's profile (JWT required)
  
- **PATCH /api/v1/users/update-account**
  - Update account details (JWT required)
  
- **PATCH /api/v1/users/avatar**
  - Update the user's avatar (JWT required, file upload)
  
- **PATCH /api/v1/users/cover-image**
  - Update the user's cover image (JWT required, file upload)
  
- **GET /api/v1/users/c/:username**
  - Get the user's channel profile (JWT required)
  
- **GET /api/v1/users/watch-history**
  - Get the user's watch history (JWT required)

### Video Routes

- **POST /api/v1/videos/publish-video**
  - Publish a video (file upload)
  
- **GET /api/v1/videos/all-videos**
  - Get all videos with query parameters
  
- **GET /api/v1/videos/c/:videoId**
  - Get a video by its ID
  
- **PATCH /api/v1/videos/update-video/:videoId**
  - Update a video by its ID
  
- **DELETE /api/v1/videos/delete-video/:videoId**
  - Delete a video by its ID
  
- **PATCH /api/v1/videos/toggle-status/:videoId**
  - Toggle the publication status of a video

### Tweet Routes

- **POST /api/v1/tweets/**
  - Create a tweet
  
- **GET /api/v1/tweets/user/:userId**
  - Get tweets by a user
  
- **PATCH /api/v1/tweets/:tweetId**
  - Update a tweet
  
- **DELETE /api/v1/tweets/:tweetId**
  - Delete a tweet

### Subscription Routes

- **GET /api/v1/subscriptions/c/:channelId**
  - Get the list of subscribed channels
  
- **POST /api/v1/subscriptions/c/:channelId**
  - Toggle subscription to a channel
  
- **GET /api/v1/subscriptions/u/:subscriberId**
  - Get subscribers for a channel

### Playlist Routes

- **POST /api/v1/playlist/playlists**
  - Create a playlist
  
- **GET /api/v1/playlist/:playlistId**
  - Get a playlist by its ID
  
- **PATCH /api/v1/playlist/:playlistId**
  - Update a playlist by its ID
  
- **DELETE /api/v1/playlist/:playlistId**
  - Delete a playlist by its ID
  
- **PATCH /api/v1/playlist/add/:videoId/:playlistId**
  - Add a video to a playlist
  
- **PATCH /api/v1/playlist/remove/:videoId/:playlistId**
  - Remove a video from a playlist
  
- **GET /api/v1/playlist/user/:userId**
  - Get playlists created by a user

### Like Routes

- **POST /api/v1/likes/toggle/v/:videoId**
  - Toggle like on a video
  
- **POST /api/v1/likes/toggle/c/:commentId**
  - Toggle like on a comment
  
- **POST /api/v1/likes/toggle/t/:tweetId**
  - Toggle like on a tweet
  
- **GET /api/v1/likes/videos**
  - Get liked videos

### Comment Routes

- **GET /api/v1/comments/:videoId**
  - Get all comments for a video
  
- **POST /api/v1/comments/:videoId**
  - Add a comment to a video
  
- **PATCH /api/v1/comments/c/:commentId**
  - Update a comment
  
- **DELETE /api/v1/comments/c/:commentId**
  - Delete a comment

### Dashboard Routes

- **GET /api/v1/dashboard/:channelId/stats**
  - Get statistics for a channel
  
- **GET /api/v1/dashboard/videos/:channelId**
  - Get videos for a channel

### Healthcheck Route

- **GET /api/v1/healthcheck/**
  - Health check route to verify the API status

