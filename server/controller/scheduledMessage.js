const cron = require("node-cron");
const Message = require("../models/Message");

function startScheduledMessageProcessor(io, sharedState) {
    // Debug logging for initial state
    console.log("Initial shared state:", Array.from(sharedState.getUserActiveChats().entries()));

    // Add state change listener
    const originalUpdate = sharedState.updateUserActiveChats;
    sharedState.updateUserActiveChats = function (userId, data) {
        originalUpdate.call(this, userId, data);
        console.log("SharedState updated:", Array.from(this.getUserActiveChats().entries()));
    };

    cron.schedule("* * * * *", async () => {
        try {
            const currentActiveChats = sharedState.getUserActiveChats();
            const currentTime = new Date();
            // Get fresh data instead of using stale reference
    
            console.log("Processing scheduled messages with active chats:", currentActiveChats);

            
            const messagesToSend = await Message.find({
                scheduled: true,
                pending: true,
                timestamp: { $lte: currentTime }
            });

            for (const message of messagesToSend) {
                const receiverId = message.receiverId.toString();
                const senderId = message.senderId.toString();

                const receiverStatus = currentActiveChats.get(receiverId);
                console.log('Message:', {
                    receiverId,
                    senderId,
                    activeChat: receiverStatus?.activeChat
                });

                const isReceiverViewingSenderChat = receiverStatus?.activeChat === senderId;
                console.log(isReceiverViewingSenderChat)
                const updatedMessage = await Message.findByIdAndUpdate(
                    message._id,
                    {
                        scheduled: false,
                        pending: false,
                        read: isReceiverViewingSenderChat
                    },
                    { new: true }
                );

                io.emit("receiveMessage", {
                    ...updatedMessage._doc,
                    isNew: true,
                    scheduled: false,
                    pending: false
                });

                if (!isReceiverViewingSenderChat) {
                    const unreadCount = await Message.countDocuments({
                        receiverId: message.receiverId,
                        senderId: message.senderId,
                        read: false
                    });

                    io.emit("unreadCountUpdate", {
                        userId: message.receiverId,
                        senderId: message.senderId,
                        count: unreadCount
                    });
                }
            }
        } catch (error) {
            console.error("Error processing scheduled messages:", error);
        }
    });
}

module.exports = startScheduledMessageProcessor;