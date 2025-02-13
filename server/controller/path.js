const Post = require("../models/Post");

const createPost = async (req, res) => {
    try {
        console.log("Form Data:", req.body); // Log non-file data (text, username)
        console.log("Files:", req.files); // Log uploaded file data

        // Check if required data is present
        const { userId, description } = req.body;

        // Validate that essential fields exist
        if (!userId || !description) {
            return res.status(400).json({ message: "User ID and description are required." });
        }

        // If file is required but not uploaded
        if (!req.file) {
            return res.status(400).json({ message: "Image is required." });
        }

        // Create new post with received data
        const newPost = new Post({
            username: userId, // Assuming 'userId' represents the username
            image_url: `/uploads/${req.file.filename}`, // Update path based on your upload config
            caption: description,
        });

        // Save the new post to the database
        const savedPost = await newPost.save();

        // Return success response with the saved post
        res.status(201).json({ message: "Post created successfully", post: savedPost });
        

    } catch (error) {
        console.error("Error in post creation:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = { createPost };
