const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    username: { type: String, required: true },
    image_url: { type: String, required: true },
    caption: { type: String, default: "" },
    likes_count: { type: Number, default: 0 },
    liked_by: [{ type: String }],
    
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", postSchema);
