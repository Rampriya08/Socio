const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Adjust the path based on your folder structure
const mongoose = require("mongoose");
const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
    const { username, email, password, gender,bio } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Generate profile picture URL based on gender
        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;
        const profilePicture = gender === "male" ? boyProfilePic : girlProfilePic;

        // Hash password and create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            gender,
            profile_picture: profilePicture,
            bio,
        });

        await newUser.save();
        const token = jwt.sign({ id: newUser._id }, "SECRET_KEY", { expiresIn: "1h" });
        // Exclude sensitive data (password) from response
        const userResponse = {
            id: newUser._id,
            username: newUser.username,
        };

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: userResponse,
        });
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ message: "Error registering user" });
    }
});

// User Login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid Username" });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, "SECRET_KEY", { expiresIn: "1h" });

        // Exclude sensitive data (password) from response
        const userResponse = {
            id: user._id,
            username: user.username,
            
        };

        res.status(200).json({
            message: "Login successful",
            token,
            user: userResponse,
        });
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).json({ message: "Error logging in" });
    }
});



router.get("/s/search", async (req, res) => {
  try {
    const query = req.query.q;
    console.log(query, "--");
    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const users = await User.find({
      username: { $regex: query, $options: "i" }, // Case-insensitive search
    }).select("username _id"); // Only return necessary fields

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});
// Route to fetch user data by user ID
router.get("/:username", async (req, res) => {

    try {
        const { username } = req.params;
        console.log(`Fetching user with username: ${username}`);

        const user = await User.findOne({ username }); // Adjust based on your schema

        if (!user) {
            console.error(`User not found: ${username}`);
            return res.status(404).json({ error: "User not found" });
        }

        console.log(user.profile_picture); // Check if profile_picture field exists
        res.json({
            profile_pic: user.profile_picture, // Ensure correct field name
            username: user.username,
        });
    } catch (error) {
        console.error('Server error:', error); // Log the error details
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/:username/follow", async (req, res) => {
  try {
    const { username } = req.params;
    const { userId } = req.body; // The logged-in user ID

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userToFollow = await User.findOne({ username });
    const currentUser = await User.findById(userId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.following.includes(userToFollow.username)) {
      return res.status(400).json({ message: "You already follow this user" });
    }

    currentUser.following.push(userToFollow.username);
    userToFollow.followers.push(currentUser.username);

    currentUser.followingCount++;
    userToFollow.followersCount++;

    await currentUser.save();
    await userToFollow.save();

    res.json({ message: `You are now following ${username}` });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Unfollow a user
router.post("/:username/unfollow", async (req, res) => {
  try {
    const { username } = req.params;
    const { userId } = req.body; // The logged-in user ID

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userToUnfollow = await User.findOne({ username });
    const currentUser = await User.findById(userId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.following.includes(userToUnfollow.username)) {
      return res
        .status(400)
        .json({ message: "You are not following this user" });
    }

    currentUser.following = currentUser.following.filter(
      (name) => name !== userToUnfollow.username
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (name) => name !== currentUser.username
    );

    currentUser.followingCount--;
    userToUnfollow.followersCount--;

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: `You have unfollowed ${username}` });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/:username/followers", async (req, res) => {
    try {
        const { username } = req.params;

        // Find the user by username
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user.followers);
    } catch (err) {
        res.status(500).json({ message: "Error fetching followers", error: err.message });
    }
});
router.get("/:username/following", async (req, res) => {
    try {
        const { username } = req.params;
        
        // Find the user by username
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log(user.following);
        // Return the following list with username and profile_pic fields
        res.status(200).json(user.following);
    } catch (error) {
        console.error("Error fetching following list:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/get/:username", async (req, res) => {
try {
   
    const user = await User.findOne({ username: req.params.username });    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
}
});
router.get("/", async (req, res) => {
    try {
        const users = await User.find({}, "username profile_picture");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};


const getMutualFollowersAggregation = async (userId, profile) => {
    try {
        if (!isValidObjectId(userId)) {
            throw new Error('Invalid user ID format');
        }

        // First, if profile is not an ObjectId, try to find the user by username
        let profileId = profile;
        if (!isValidObjectId(profile)) {
            const profileUser = await User.findOne({ username: profile });
            if (!profileUser) {
                throw new Error('Profile not found');
            }
            profileId = profileUser._id;
        }

        // Debug log to check IDs
        console.log('Looking up mutual followers for:', {
            userId: userId,
            profileId: profileId
        });

        // First, verify both users exist and have followers
        const [user1, user2] = await Promise.all([
            User.findById(userId),
            User.findById(profileId)
        ]);

        console.log('Users found:', {
            user1Followers: user1?.followers?.length || 0,
            user2Followers: user2?.followers?.length || 0
        });

        const mutualFollowers = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    localField: 'followers',
                    as: 'followerDetails'
                }
            },
            {
                $unwind: '$followerDetails'
            },
            {
                $match: {
                    'followerDetails.followers': new mongoose.Types.ObjectId(profileId)
                }
            },
            {
                $project: {
                    _id: '$followerDetails._id',
                    username: '$followerDetails.username',
                    profile_pic: '$followerDetails.profile_pic'
                }
            }
        ]);

        // Debug log the results
        console.log('Mutual followers found:', mutualFollowers.length);

        return mutualFollowers;
    } catch (error) {
        console.error('Error in getMutualFollowersAggregation:', error);
        throw error;
    }
};

router.get('/:userId/followers', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID format"
            });
        }

        const user = await User.findById(userId).populate('followers', 'username profile_pic');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.followers);
    } catch (error) {
        console.error('Error getting followers:', error);
        res.status(500).json({ message: "Error getting followers", error: error.message });
    }
});

router.get('/:userId/following', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID format"
            });
        }

        const user = await User.findById(userId).populate('following', 'username profile_pic');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.following);
    } catch (error) {
        console.error('Error getting following:', error);
        res.status(500).json({ message: "Error getting following", error: error.message });
    }
});

router.get('/:userId/mutual-followers/:profile', async (req, res) => {
    try {
        const { userId, profile } = req.params;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID format",
                details: "User ID must be a valid MongoDB ObjectId"
            });
        }

        const mutualFollowers = await getMutualFollowersAggregation(userId, profile);
        res.json(mutualFollowers);
    } catch (error) {
        console.error('Error getting mutual followers:', error);
        if (error.message === 'Invalid user ID format') {
            res.status(400).json({ message: error.message });
        } else if (error.message === 'Profile not found') {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Error getting mutual followers", error: error.message });
        }
    }
});

module.exports = router;
