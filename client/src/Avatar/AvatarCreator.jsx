import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedChatAvatar = ({
    isOnline = false,
    isTyping = false,
    avatarUrl = "https://api.dicebear.com/6.x/adventurer/svg?seed=Felix"
}) => {
    const [expression, setExpression] = useState('neutral');

    // Expression URLs for different states
    const expressionAvatars = {
        neutral: avatarUrl,
        typing: `${avatarUrl}&options[mouth]=variant02`,  // Thinking expression
        happy: `${avatarUrl}&options[mouth]=variant03`,    // Smiling expression
        offline: `${avatarUrl}&options[eyes]=variant04`    // Sleepy expression
    };

    // Update expression based on user state
    useEffect(() => {
        if (isTyping) {
            setExpression('typing');
        } else if (isOnline) {
            setExpression('happy');
        } else {
            setExpression('offline');
        }
    }, [isTyping, isOnline]);

    return (
        <div className="relative">
            {/* Avatar Container */}
            <motion.div
                className="w-16 h-32 relative"
                initial={{ y: 0 }}
                animate={{
                    y: isOnline ? [0, -10, 0] : 40 // Hide half when offline
                }}
                transition={{
                    duration: 0.5,
                    ease: "easeInOut"
                }}
            >
                {/* Avatar Image */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={expression}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full relative"
                    >
                        <img
                            src={expressionAvatars[expression]}
                            alt="Chat Avatar"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-6 right-0 bg-white p-2 rounded-full shadow-lg"
                    >
                        <div className="flex gap-1">
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                                className="w-2 h-2 bg-gray-500 rounded-full"
                            />
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.5, delay: 0.15 }}
                                className="w-2 h-2 bg-gray-500 rounded-full"
                            />
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.5, delay: 0.3 }}
                                className="w-2 h-2 bg-gray-500 rounded-full"
                            />
                        </div>
                    </motion.div>
                )}

                {/* Online Status Indicator */}
                <div
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                />
            </motion.div>
        </div>
    );
};

// Chat Interface Component
const ChatInterface = () => {
    const [isTyping, setIsTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [message, setMessage] = useState('');

    // Simulate typing detection
    useEffect(() => {
        let typingTimer;
        if (message) {
            setIsTyping(true);
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                setIsTyping(false);
            }, 1000);
        } else {
            setIsTyping(false);
        }

        return () => clearTimeout(typingTimer);
    }, [message]);

    return (
        <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
            <div className="flex gap-4">
                {/* Avatar Section */}
                <AnimatedChatAvatar
                    isOnline={isOnline}
                    isTyping={isTyping}
                />

                {/* Chat Input Section */}
                <div className="flex-1">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                        placeholder="Type a message..."
                    />

                    {/* Online Toggle (for demo) */}
                    <button
                        onClick={() => setIsOnline(!isOnline)}
                        className={`mt-2 px-3 py-1 rounded-lg ${isOnline ? 'bg-green-500' : 'bg-gray-400'
                            } text-white text-sm`}
                    >
                        Toggle Online Status
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;