const fs = require('fs');

const express = require("express");
const multer = require("multer");

const Post = require("../models/Post");
const path = require('path');
const { createPost } = require('../controller/path');
const router = express.Router();
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Directory for uploaded images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Unique filename
    }
});
const upload = multer({ storage: storage });


// CREATE a new post
router.post("/add", upload.single("picture"), createPost); 
router.post('/:id/like', async (req, res) => {
    try {
        const postId = req.params.id;
        const username = req.body.username; // Username of the user liking the post

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if the user has already liked the post
        if (post.liked_by.includes(username)) {
            return res.status(400).json({ error: 'You have already liked this post' });
        }

        // Add the user to the liked_by list and increment the likes count
        post.liked_by.push(username);
        post.likes_count += 1;
        await post.save();

        res.status(200).json({ message: 'Post liked successfully', post });
    } catch (error) {
        console.error('Error liking the post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
   
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find().sort({ created_at: -1 }); // Sort by latest posts
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching posts", error });
    }
});
                 

router.get('/:userId', async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.params.userId });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
router.get("/:username/posts", async (req, res) => {
    try {
        const posts = await Post.find({ username: req.params.username});
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "Error fetching posts", error: err.message });
    }
});


module.exports = router;

