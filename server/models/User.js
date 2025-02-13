const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true }, // Added gender field
    profile_picture: { type: String, default: "default-profile.jpg" },
    bio: { type: String, default: "" },
    postsCount: { type: Number, default: 0 },
    followers: [{ type: String, ref: "User" }],
    following: [{ type: String, ref: "User" }],
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },

});

module.exports = mongoose.model("User", userSchema);
