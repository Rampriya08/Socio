const express = require("express"); 
const Message = require("../models/Message"); // Adjust the path based on your folder structure
const mongoose = require("mongoose");
const router = express.Router();

router.get('/:selectedUserId', async (req, res) => {
    const { selectedUserId } = req.params;
    const userId = req.query.userId;

    try {
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: userId }
            ]
        }).sort({ timestamp: 1 });
        await Message.updateMany(
            {
                senderId: selectedUserId,
                receiverId: userId,
                read: false
            },
            { read: true }
        );

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching chat history' });
    }
});

// Send a new message
router.post("/add", async (req, res) => {
    const { senderId, receiverId, content } = req.body;
 
    if (!senderId || !receiverId || !content) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const message = new Message({
            senderId,
            receiverId,
            content,
        });
        console.log(message)
        await message.save();

        res.status(201).json({ message: "Message sent successfully", data: message });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/unread-counts/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(userId);
        const counts = await getUnreadCounts(userId);
        res.json(counts);
    } catch (error) {
        console.error("Error fetching unread counts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const getUnreadCounts = async (userId) => {
    const currentTime = new Date(); // Define current time

    const unreadCounts = await Message.aggregate([
        {
            $match: {
                receiverId: new mongoose.Types.ObjectId(userId),
                read: false,
                timestamp: { $lte: currentTime }  // Ensure timestamp is not in the future
            }
        },
        {
            $group: {
                _id: "$senderId",
                count: { $sum: 1 }
            }
        }
    ]);

    const countsMap = {};
    unreadCounts.forEach(({ _id, count }) => {
        countsMap[_id.toString()] = count;
    });

    return countsMap;
};

// API to mark messages as read when a user opens a chat
router.get("/latest-message/:userId/:selectedUserId", async (req, res) => {
    console.log(Message); // Should log the Mongoose model function
    console.log(typeof Message.findOne); // Should log 'function'
    try {
        const { userId, selectedUserId } = req.params;

        const currentTime = new Date(); // Get current time

        const latestMessage = await Message.findOne({
            $or: [
                { senderId: userId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: userId },
            ],
            timestamp: { $lte: currentTime } // Ensure timestamp is not in the future
        })
            .sort({ timestamp: -1 }) // Ensures latest message is fetched
            .lean(); // Improves performance by returning plain JS object

        if (!latestMessage) {
            return res.json({ content: null });
        }

        console.log("Latest Message Response:", latestMessage.content);

        return res.json({
            content: latestMessage.content,
            senderId: latestMessage.senderId,
            receiverId: latestMessage.receiverId,
            timestamp: latestMessage.timestamp,
        });

    } catch (error) {
        console.error("Error fetching latest message:", error);
        res.status(500).json({ error: "Failed to fetch latest message" });
    }
});


// Function to fetch unread message counts


module.exports=router;