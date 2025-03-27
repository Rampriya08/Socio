import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { format } from "date-fns";
import useOnlineUsers from "./OnlineUsers";
import DateTimePicker from "react-datetime-picker";
import { CalendarIcon } from "lucide-react"; // Import an icon library
import { Clock, Smile, Frown, Meh } from "lucide-react";
const TypingIndicator = ({ username, emotion }) => {
    return (
        <div className="relative items-center gap-2 p-2 bg-gray-100 rounded-lg w-fit max-w-xs">
            <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-sm text-gray-600">{username} is typing</span>
            {emotion && emotion !== 'neutral' && (
                <EmotionIcon emotion={emotion} />
            )}
        </div>
    );
};

const EmotionIcon = ({ emotion }) => {
    switch (emotion) {
        case 'happy':
            return <Smile className="w-4 h-4 text-green-500" />;
        case 'sad':
            return <Frown className="w-4 h-4 text-blue-500" />;
        case 'angry':
            return <Frown className="w-4 h-4 text-red-500" />;
        default:
            return null;
    }
};

const detectEmotion = (text) => {
    const happyWords = ['happy', 'great', 'awesome', 'excellent', 'good', 'love', '😊', '😃', '❤️'];
    const sadWords = ['sad', 'bad', 'terrible', 'awful', 'sorry', 'upset', '😢', '😭', '😔'];
    const angryWords = ['angry', 'mad', 'hate', 'frustrated', 'annoying', '😠', '😡', '🤬'];

    const lowercaseText = text.toLowerCase();

    if (happyWords.some(word => lowercaseText.includes(word))) return 'happy';
    if (sadWords.some(word => lowercaseText.includes(word))) return 'sad';
    if (angryWords.some(word => lowercaseText.includes(word))) return 'angry';
    return 'neutral';
};
const Chatting = ({ selectedUser, unread }) => {
    console.log("Count" + unread)
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [typingEmotion, setTypingEmotion] = useState(null);
    const user = JSON.parse(localStorage.getItem("user"));
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const unreadCountRef = useRef(unread);
    const [unreadCountState, setUnreadCountState] = useState(unread); // For UI updates
    const onlineUsers = useOnlineUsers();
    const onlineUsersRef = useRef(onlineUsers); // Ref to store onlineUsers
    const [scheduleTime, setScheduleTime] = useState("");
    const typingTimeoutRef = useRef(null);
    console.log(unreadCountRef.current, unreadCountState)
    useEffect(() => {
        unreadCountRef.current = unread;
        setUnreadCountState(unread);
        console.log(unreadCountRef.current, unreadCountState)
    }, [selectedUser, unread]);
    // Update the ref whenever onlineUsers changes
    useEffect(() => {
        onlineUsersRef.current = onlineUsers;
    }, [onlineUsers]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        console.log("Updated onlineUsers:", onlineUsers); // Log every time onlineUsers is updated
    }, [onlineUsers]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const addSeparatorsToMessages = (messages) => {
        if (!messages.length) return messages;

        const processedMessages = [];
        let currentDate = null;

        messages.forEach(message => {
            const messageDate = new Date(message.timestamp);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            const messageDateString = messageDate.toDateString();
            const todayString = today.toDateString();
            const yesterdayString = yesterday.toDateString();

            let separatorText;
            if (messageDateString === todayString) {
                separatorText = "Today";
            } else if (messageDateString === yesterdayString) {
                separatorText = "Yesterday";
            } else {
                separatorText = messageDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }

            if (separatorText !== currentDate) {
                processedMessages.push({
                    separator: separatorText,
                    timestamp: message.timestamp
                });
                currentDate = separatorText;
            }

            processedMessages.push(message);
        });

        return processedMessages;
    };

    useEffect(() => {
        if (!selectedUser) return;

        socketRef.current = io("http://localhost:5000", {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            withCredentials: true
        });
        const handleReceiveMessage = (newMessage) => {
            //console.log("Unread" + unreadCountRef.current);



            console.log("Unread" + unreadCountRef.current)

            // console.log(newMessage.receiverId === user.id, onlineUsersRef.current); // Use the ref here
            if (newMessage.receiverId === user.id) {
                //console.log("Online Users:", Array.isArray(onlineUsersRef.current), onlineUsersRef.current);
                console.log("----")
                console.log(newMessage.scheduled)
                const receivingUser = onlineUsersRef.current.find(u => u.userId === user.id);
                if (newMessage.senderId === receivingUser.activeChat && !newMessage.scheduled) {
                    if (selectedUser._id === newMessage.senderId && unreadCountRef.current) {
                        unreadCountRef.current = unreadCountRef.current + 1;
                        setUnreadCountState(prev => prev + 1);

                    }
                    const receivingUser = onlineUsersRef.current.find(u => u.userId === user.id);
                    if (newMessage.senderId === receivingUser.activeChat) {
                        setMessages(prevMessages => {
                            // Check for duplicate messages
                            if (prevMessages.some(msg => msg._id === newMessage._id)) {
                                return prevMessages;
                            }

                            const updatedMessages = [...prevMessages, newMessage];
                            return addSeparatorsToMessages(
                                updatedMessages.filter(msg => !msg.separator)
                            );
                        });

                    }
                    console.log(newMessage.senderId === receivingUser.activeChat);
                    //console.log("Receiving User:", JSON.stringify(receivingUser, null, 2));
                }
            }

            if (newMessage.senderId === user.id) {
                if (newMessage.isSchedule) {
                    setMessages(prevMessages => {
                        const isExistingMessage = prevMessages.some(msg => msg._id === newMessage._id);

                        // If the message already exists, update it
                        const updatedMessages = prevMessages.map(msg =>
                            msg._id === newMessage._id ? { ...msg, ...newMessage } : msg
                        );

                        // If the message is new, add it without separators
                        if (!isExistingMessage) {
                            updatedMessages.push(newMessage);
                            return updatedMessages; // Return messages without applying separators
                        }

                        // Otherwise, apply separators as usual
                        return addSeparatorsToMessages(updatedMessages.filter(msg => !msg.separator));
                    });


                } else {
                    setMessages(prevMessages => {
                        // Check for duplicate messages
                        if (prevMessages.some(msg => msg._id === newMessage._id)) {
                            return prevMessages;
                        }

                        const updatedMessages = [...prevMessages, newMessage];
                        return addSeparatorsToMessages(
                            updatedMessages.filter(msg => !msg.separator)
                        );
                    });
                }
            }


        };

        const fetchMessages = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/api/chat/${selectedUser._id}?userId=${user.id}`
                );
                if (!response.ok) throw new Error("Failed to fetch chat history");
                const data = await response.json();
                const messagesToProcess = data.filter(message => !(message.scheduled === true && message.receiverId === user.id));
                const processedData = addSeparatorsToMessages(messagesToProcess);
                setMessages(processedData);
                setLoading(false);

                socketRef.current.emit('chatWindowOpened', {
                    userId: user.id,
                    selectedUserId: selectedUser._id
                });

                socketRef.current.emit('markMessagesAsRead', {
                    senderId: selectedUser._id,
                    receiverId: user.id
                });
            } catch (error) {
                console.error("Error:", error);
                setLoading(false);
            }
        };

        const handleMessagesRead = () => {
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.timestamp <= Date.now() // Only update past messages
                        ? { ...msg, read: true }
                        : msg // Keep future messages unchanged
                )
            );
        };

        socketRef.current.on('connect', () => {
            console.log("Socket connected successfully");

            socketRef.current.emit("userConnected", {
                userId: user.id,
                username: user.username
            });
        });

        socketRef.current.on('receiveMessage', handleReceiveMessage);
        socketRef.current.on('messagesRead', handleMessagesRead);
        socketRef.current.on('typing', (data) => {
            if (data.senderId === selectedUser._id) {
                setIsTyping(true);
                setTypingEmotion(data.emotion);

                // Clear existing timeout
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }

                // Set new timeout
                typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                    setTypingEmotion(null);
                }, 2000);
            }
        });


        socketRef.current.emit('joinRoom', {
            userId: user.id,
            selectedUserId: selectedUser._id,
        });

        fetchMessages();

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('chatWindowClosed', {
                    userId: user.id,
                    selectedUserId: selectedUser._id
                });
                socketRef.current.disconnect();
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

        };
    }, [selectedUser]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        const isValidScheduleTime = scheduleTime && !isNaN(new Date(scheduleTime).getTime());

        const messageData = {
            senderId: user.id,
            receiverId: selectedUser._id,
            content: newMessage.trim(),
            read: false,
            timestamp: isValidScheduleTime ? new Date(scheduleTime).toISOString() : new Date().toISOString(),
            scheduled: isValidScheduleTime, // Ensure it's true only when `scheduleTime` is valid
        };

        console.log("Final messageData:", messageData);


        /* setMessages(prevMessages => {
             const updatedMessages = [...prevMessages, messageData];
             return addSeparatorsToMessages(
                 updatedMessages.filter(msg => !msg.separator)
             );
         });
 */
        unreadCountRef.current = 0;
        setUnreadCountState(0);
        if (messageData.scheduled) {
            socketRef.current.emit("scheduleMessage", messageData); // New event for scheduling
        } else {
            socketRef.current.emit("sendMessage", messageData);
        }
        setNewMessage("");
        setScheduleTime("")
    };

    const handleTyping = (text) => {
        const emotion = detectEmotion(text);
        console.log(emotion)
        if (socketRef.current) {
            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Emit typing status with emotion
            socketRef.current.emit("typing", {
                senderId: user.id,
                receiverId: selectedUser._id,
                emotion: emotion
            });

            // Set new timeout
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
            }, 2000);
        }
    };

    const formatTimestamp = (timestamp) => {
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) {
                console.error('Invalid timestamp:', timestamp);
                return '';
            }
            return format(date, "hh:mm a");
        } catch (error) {
            console.error('Error formatting timestamp:', error);
            return '';
        }
    };

    const renderMessages = () => {
        if (loading) return <p className="">Loading messages...</p>;
        if (messages.length === 0) return <p className="">No messages yet.</p>;

        return messages.map((item, index) => {
            if (item.separator) {
                return (
                  <div
                    key={`separator-${item.timestamp}`}
                    className="flex items-center my-4"
                  >
                    <div className="flex-1 border-t dark:border-gray-300 border-gray-800"></div>
                    <span className="mx-4 px-3 py-1 dark:bg-gray-300 dark:text-gray-800 bg-gray-700 text-white rounded-full text-sm">
                      {item.separator}
                    </span>
                    <div className="flex-1 border-t dark:border-gray-300 border-gray-800"></div>
                  </div>
                );
            }

            if (typeof item !== 'object' || !item.content) {
                console.error('Invalid message item:', item);
                return null;
            }

            const separatorIndex = messages.length - unreadCountState;
            const showUnreadSeparator = index === separatorIndex && unreadCountState > 0;


            return (
              <React.Fragment key={item._id || index}>
                {showUnreadSeparator && (
                  <div className="flex items-center my-4">
                    <div className="flex-1 border-t dark:border-gray-300 border-gray-800"></div>
                    <span className="mx-4 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      {unreadCountState} New Messages
                    </span>
                    <div className="flex-1 border-t dark:border-gray-300 border-gray-800"></div>
                  </div>
                )}
                <div
                  className={`flex ${
                    item.senderId === user.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className={`flex flex-col `}>
                    <div className="flex items-center gap-1">
                      {item.isSchedule && item.senderId === user.id && (
                        <Clock className="w-4 h-4 " />
                      )}
                      <p
                        className={`rounded-lg px-3 py-2 mb-1 ${
                          item.senderId === user.id
                            ? "bg-bh text-white"
                            : "bg-gray-200 text-black "
                        }`}
                      >
                        {item.content}
                      </p>
                    </div>

                    <span className="text-xs text-right mr-1">
                      {item.timestamp ? formatTimestamp(item.timestamp) : ""}
                    </span>
                    {item.senderId === user.id && (
                      <span className="text-xs text-right mr-1">
                        {item.read ? (
                          <span className="text-blue-500">✓✓</span>
                        ) : (
                          <span className="text-gray-400">✓</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
        }).filter(Boolean);
    };

    return (
      <div className="chat-container flex flex-col h-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg ">
        {/* Chat Header */}
        <div className="chat-header p-4 bg-bh text-white ">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">
              {selectedUser ? selectedUser.username : "Loading..."}
            </h2>
          </div>
        </div>

        {/* Chat Messages + Input Wrapper */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages Section */}
          <div className="chat-messages flex-1 overflow-y-auto  no-scrollbar p-4 pb-20">
            {renderMessages()}
            {isTyping && (
              <div className="ml-4">
                <TypingIndicator
                  username={selectedUser.username}
                  emotion={typingEmotion}
                />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input (Positioned at the Bottom) */}
          <div className="chat-input p-4  w-full flex items-center gap-2 border-t dark:border-gray-700">
            {/* Message Input - Largest */}
            <div className="flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping(e.target.value);
                }}
                placeholder="Type a message..."
                className="w-full p-3 border dark:border-gray-700 dark:text-white dark:bg-gray-800  rounded-lg"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
            </div>

            {/* DateTime Picker - Small */}
            <div className="w-1/5 min-w-[130px]  text-black dark:text-white">
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full border dark:border-gray-700 rounded p-2 text-sm dark:text-white dark:bg-gray-800"
              />
            </div>

            {/* Send Button - Small */}
            <div className="w-1/6 min-w-[100px]">
              <button
                onClick={handleSendMessage}
                className="w-full bg-bh  text-white px-4 py-2 rounded-lg transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Chatting;