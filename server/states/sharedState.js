
class SharedState {
    constructor() {
        this.userActiveChats = new Map();
    }

    // Method to update userActiveChats
    updateUserActiveChats(userId, data) {
        this.userActiveChats.set(userId, data);
    }

    // Method to get userActiveChats
    getUserActiveChats() {
        return this.userActiveChats;
    }

    // Method to delete a user from userActiveChats
    deleteUserActiveChats(userId) {
        this.userActiveChats.delete(userId);
    }
}

// Export a singleton instance
module.exports = new SharedState();