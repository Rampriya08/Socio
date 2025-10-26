const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
const app = express();
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const chatRoutes = require("./routes/chatRoutes");
const server = http.createServer(app);
const Message = require("./models/Message");
const startScheduledMessageProcessor = require("./controller/scheduledMessage");
dotenv.config();
const schedule = require("node-schedule");
const cron = require("node-cron");
const sharedState = require("./states/sharedState");
// Enhanced logging utility
const logSocketEvent = (event, data) => {
    console.group(`Socket Event: ${event}`);
    console.log("Timestamp:", new Date().toISOString());
    console.log("Data:", data);
    console.groupEnd();
};

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "https://talkspace-socio.netlify.app"],
    methods: ["GET", "POST"],
  },
  transports: ["polling"], // 👈 use only polling
});
// Update your Express CORS settings too
const allowedOrigins = [
  "http://localhost:3000",
  "https://talkspace-socio.netlify.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow server-to-server requests
      if (allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// Routes
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chat", chatRoutes);
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});
// Track active chat windows for each user
const { userActiveChats } = sharedState; // userId -> { socketId, activeChat }
const onlineUsers = new Map(); // userId -> { socketId, username, lastActive, activeChat }



// Function to mark messages as read
const markMessagesAsRead = async (senderId, receiverId) => {
    const currentUser = onlineUsers.get(receiverId);
    if(currentUser){
   // if (receiverId === currentUser.activeChat)
    try {
        const currentTime = new Date();
        // Update messages in the database
        const updatedMessages = await Message.updateMany(
            {
                $or: [
                    { senderId, receiverId, read: false, timestamp: { $lte: currentTime } },
                    { senderId: receiverId, receiverId: senderId, read: false, timestamp: { $lte: currentTime } },
                    
                ],
            },
            { $set: { read: true } }
        );

        if (updatedMessages.modifiedCount > 0) {
            console.log(`Messages between ${senderId} and ${receiverId} marked as read`);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error marking messages as read:", error);
        return false;
    }
}
};

// Socket.IO Event Handlers
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Event: User connected
    socket.on("userConnected", ({ userId, username }) => {
        console.log("User connected:", { userId, username });

        // Store user information
        onlineUsers.set(userId, {
            userId,
            username,
            socketId: socket.id,
            lastActive: new Date(),
            activeChat: null, // Initially, no active chat
        });

        // Broadcast updated online users list
        const onlineUsersList = Array.from(onlineUsers.values());
        console.log("Broadcasting online users:", onlineUsersList);
        io.emit("userStatusUpdate", {
            users: onlineUsersList,
        });
    });

    // Event: Chat window opened
    socket.on("chatWindowOpened", async ({ userId, selectedUserId }) => {
        // Update active chat for the user
        onlineUsers.set(userId, {
            ...onlineUsers.get(userId),
            activeChat: selectedUserId,
        });

        // Track active chat window
        sharedState.updateUserActiveChats(userId, {
            socketId: socket.id,
            activeChat: selectedUserId,
        });
        console.log("Updated active chats:", Array.from(sharedState.getUserActiveChats().entries()));
        console.log("Chat Window Opened:", {
            userId,
            selectedUserId,
            activeChats: Array.from(userActiveChats.entries()).map(([uid, data]) => ({
                userId: uid,
                socketId: data.socketId,
                activeChat: data.activeChat,
            })),
        });

        // Mark messages as read
        const messagesMarked = await markMessagesAsRead(userId, selectedUserId);

        if (messagesMarked) {
            // Notify BOTH users via their personal rooms
            io.to(userId).to(selectedUserId).emit("messagesRead", {
                senderId: selectedUserId, // User 1's ID
                receiverId: userId,       // User 2's ID
            });
        }

        // Broadcast updated online users list with active chat information
        const onlineUsersList = Array.from(onlineUsers.values());
        console.log("Broadcasting online users:", onlineUsersList);
        io.emit("userStatusUpdate", {
            users: onlineUsersList,
        });

        io.emit("userActivityUpdate", {
            userId,
            activity: "Opened chat",
            timestamp: new Date(),
        });


    });
    socket.on("scheduleMessage", async (messageData) => {
        try {
            const { senderId, receiverId, content, timestamp, scheduled } = messageData;
            const roomId = [senderId, receiverId].sort().join("-");

            // Check if receiver is viewing this chat
            const receiverStatus = userActiveChats.get(receiverId);
            const isReceiverViewingSenderChat = receiverStatus?.activeChat === senderId;

            // Create new message object
            const newMessage = new Message({
                senderId,
                receiverId,
                content,
                roomId,
                read: false,
                scheduled: true,
                pending: true, // Add pending flag
                timestamp,
                isSchedule:true
            });

            await newMessage.save();

            // Emit only to sender initially
            socket.emit("receiveMessage", {
                ...newMessage._doc,
                isNew: true,
                scheduled: true,
                pending: true
            });

            console.log(`Message scheduled for ${timestamp}`);
        } catch (error) {
            console.error("Message save error:", error);
            socket.emit("messageSendError", { error: error.message });
        }
    });
    // Event: Send a new message
    socket.on("sendMessage", async (messageData) => {
        try {
            const { senderId, receiverId, content } = messageData;
            const roomId = [senderId, receiverId].sort().join("-");

            // Check if receiver is viewing this chat
            const receiverStatus = userActiveChats.get(receiverId);
            const isReceiverViewingSenderChat = receiverStatus?.activeChat === senderId;

            // Create new message
            const newMessage = new Message({
                senderId,
                receiverId,
                content,
                roomId,
                read: isReceiverViewingSenderChat,
               isSchedule:false
            });

            await newMessage.save();
            const currentTime = new Date();
            // Get updated unread count for the receiver
            const unreadCount = await Message.countDocuments({
                senderId,
                receiverId,
                read: false,
                timestamp: { $lte: currentTime }
            });

            // Emit the new message
            io.emit("receiveMessage", {
                ...newMessage._doc,
                isNew: true,
            });

            // Emit updated unread count
            io.emit("unreadCountUpdate", {
                userId: receiverId,
                senderId,
                count: unreadCount,
            });

        } catch (error) {
            console.error("Message save error:", error);
            socket.emit("messageSendError", { error: error.message });
        }
    });

    // Event: Mark messages as read
    socket.on("markMessagesAsRead", async ({ senderId, receiverId }) => {
       // console.log("888888")
        const currentUser = onlineUsers.get(senderId);
        const currentTime = new Date();
       //console.log(currentUser)
       if(currentUser){
        try {
            // Update messages to read
            await Message.updateMany(
                {
                    senderId,
                    receiverId,
                    read: false,
                    timestamp: { $lte: currentTime }
                },
                { $set: { read: true } }
            );

            // Emit messages read event
            io.emit("messagesRead", {
                senderId,
                receiverId,
            });

        } catch (error) {
            console.error("Error marking messages as read:", error);
        }
    }
    });

    // Event: Fetch initial data
    socket.on("fetchInitialData", async ({ userId }) => {
        try {
            // Get all unread counts
            const unreadMessages = await Message.aggregate([
                {
                    $match: {
                        receiverId: userId,
                        read: false,
                    },
                },
                {
                    $group: {
                        _id: "$senderId",
                        count: { $sum: 1 },
                    },
                },
            ]);

            const unreadCounts = {};
            unreadMessages.forEach(({ _id, count }) => {
                unreadCounts[_id] = count;
            });

            // Get latest messages
            const latestMessages = await Message.aggregate([
                {
                    $match: {
                        $or: [
                            { senderId: userId },
                            { receiverId: userId },
                        ],
                    },
                },
                {
                    $sort: { timestamp: -1 },
                },
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $eq: ["$senderId", userId] },
                                "$receiverId",
                                "$senderId",
                            ],
                        },
                        latestMessage: { $first: "$$ROOT" },
                    },
                },
            ]);

            // Emit initial data
            socket.emit("initialData", {
                unreadCounts,
                latestMessages,
            });

        } catch (error) {
            console.error("Error fetching initial data:", error);
            socket.emit("fetchError", { error: error.message });
        }
    });

    // Event: Join a chat room
    socket.on("joinRoom", ({ userId, selectedUserId }) => {
        const roomId = [userId, selectedUserId].sort().join("-");
        socket.join(roomId); // Join the chat room
        socket.join(userId); // Join the user's personal room
        logSocketEvent("joinRoom", { roomId, userId, selectedUserId });
    });

    // Event: Typing indicator
   
        socket.on("typing", ({ senderId, receiverId, emotion }) => {
            const roomId = [senderId, receiverId].sort().join("-");
            socket.join(roomId); // Ensure the sender joins the room

            io.to(roomId).emit("typing", {
                senderId,
                username: userActiveChats.get(senderId)?.username, // Fetch username
                emotion, // Include emotion if needed
            });

            logSocketEvent("typing", { roomId, senderId, receiverId });

            io.emit("userActivityUpdate", {
                userId: senderId,
                activity: "Typing...",
                timestamp: new Date(),
            });
        });
 

    // Event: User disconnected
    socket.on("disconnect", () => {
        // Find and remove the user based on socket ID
        for (const [userId, data] of userActiveChats.entries()) {
            if (data.socketId === socket.id) {
                sharedState.deleteUserActiveChats(userId);
                console.log(`User ${userId} disconnected and removed from active chats`);
                break;
            }
        }

        for (const [userId, data] of onlineUsers.entries()) {
            if (data.socketId === socket.id) {
                console.log("User disconnected:", userId);
                onlineUsers.delete(userId);

                // Broadcast updated online users list
                const onlineUsersList = Array.from(onlineUsers.values());
                console.log("Broadcasting online users:", onlineUsersList);
                io.emit("userStatusUpdate", {
                    users: onlineUsersList,
                });
                break;
            }
        }

        console.log(
            "Client disconnected, remaining active chats:",
            Array.from(userActiveChats.entries()).map(([uid, data]) => ({
                userId: uid,
                socketId: data.socketId,
                activeChat: data.activeChat,
            }))
        );
    });

    // Event: Connection error
    socket.on("connect_error", (error) => {
        console.group("Connection Error");
        console.error("Error Type:", error.name);
        console.error("Error Message:", error.message);
        console.error("Socket ID:", socket.id);
        console.error("Timestamp:", new Date().toISOString());
        console.groupEnd();
    });
});
startScheduledMessageProcessor(io, sharedState);

// Start the server
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");
    startScheduledMessageProcessor(io, sharedState);
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });

