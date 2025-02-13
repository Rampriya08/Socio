const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    roomId: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    scheduled: { 
        type: Boolean, 
        default: false 
    }, 
    pending: { type: Boolean, default: false },
    isSchedule: { type: Boolean, default: false }

});

module.exports = mongoose.model('Message', messageSchema);
