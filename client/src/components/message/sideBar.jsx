import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import moment from "moment";
import useOnlineUsers from "./OnlineUsers";

const Sidebar = ({ onUserSelect, onUnread }) => {
    const [users, setUsers] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const onlineUsers = useOnlineUsers();
    const loggedInUserId = JSON.parse(localStorage.getItem("user"));
    const socketRef = React.useRef(null);
//console.log(onlineUsers)
    useEffect(() => {
        socketRef.current = io("http://localhost:5000", {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        // Initial data fetch
        const fetchInitialData = async () => {
            try {
                const [usersRes, countsRes] = await Promise.all([
                    axios.get("http://localhost:5000/api/user/"),
                    axios.get(`http://localhost:5000/api/chat/unread-counts/${loggedInUserId.id}`)
                ]);

                const filteredUsers = usersRes.data.filter(user => user._id !== loggedInUserId.id);
                setUnreadCounts(countsRes.data);

                // Fetch latest messages for all users
                const usersWithMessages = await Promise.all(
                    filteredUsers.map(async (user) => {
                        const messagesRes = await axios.get(
                            `http://localhost:5000/api/chat/latest-message/${loggedInUserId.id}/${user._id}`
                        );
                        return {
                            ...user,
                            latestMessage: messagesRes.data || null,
                        };
                    })
                );

                setUsers(sortUsersByLatestMessage(usersWithMessages));
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };

        fetchInitialData();

        // Socket event listeners
        socketRef.current.on("receiveMessage", (message) => {
            if (message.receiverId === loggedInUserId.id) {
                // Update unread count if the message is not from the currently selected user
                if (message.senderId !== selectedUser) {
                    setUnreadCounts(prev => ({
                        ...prev,
                        [message.senderId]: (prev[message.senderId] || 0) + 1
                    }));
                }

                // Update user list with new message
                setUsers(prevUsers => {
                    const updatedUsers = prevUsers.map(user => {
                        if (user._id === message.senderId) {
                            return {
                                ...user,
                                latestMessage: {
                                    content: message.content,
                                    timestamp: message.timestamp
                                }
                            };
                        }
                        return user;
                    });
                    return sortUsersByLatestMessage(updatedUsers);
                });
            }
            if (message.senderId === loggedInUserId.id) {
                // Update unread count if the message is not from the currently selected user
                if (message.senderId !== selectedUser) {
                    setUnreadCounts(prev => ({
                        ...prev,
                        [message.senderId]: (prev[message.senderId] || 0) + 1
                    }));
                }

                // Update user list with new message
                setUsers(prevUsers => {
                    const updatedUsers = prevUsers.map(user => {
                        if (user._id === message.receiverId) {
                            return {
                                ...user,
                                latestMessage: {
                                    content: message.content,
                                    timestamp: message.timestamp
                                }
                            };
                        }
                        return user;
                    });
                    return sortUsersByLatestMessage(updatedUsers);
                });
            }
        });

        // Handle when messages are read
        socketRef.current.on("messagesRead", ({ senderId, receiverId }) => {
            if (receiverId === loggedInUserId.id) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [senderId]: 0
                }));
            }
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [loggedInUserId.id, selectedUser]);

    // Helper function to sort users by latest message
    const sortUsersByLatestMessage = (userList) => {
        return [...userList].sort((a, b) => {
            const timeA = a.latestMessage?.timestamp ? new Date(a.latestMessage.timestamp).getTime() : 0;
            const timeB = b.latestMessage?.timestamp ? new Date(b.latestMessage.timestamp).getTime() : 0;
            return timeB - timeA;
        });
    };

    const handleUserClick = (user) => {
        setSelectedUser(user._id);

        // Emit message read event
        socketRef.current.emit("markMessagesAsRead", {
            senderId: user._id,
            receiverId: loggedInUserId.id
        });

        // Reset unread count for this user locally
        setUnreadCounts(prev => ({
            ...prev,
            [user._id]: 0
        }));

        onUserSelect(user);
        onUnread(unreadCounts[user._id] || 0);
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return "";
        const messageTime = moment(timestamp);
        const now = moment();

        if (messageTime.isSame(now, "day")) {
            return messageTime.format("hh:mm A");
        } else if (messageTime.isSame(now.subtract(1, "day"), "day")) {
            return "Yesterday";
        } else {
            return messageTime.format("MMM D");
        }
    };

    // Check if the user exists in online users
    const isUserOnline = (userId) => {
       // console.log(Array.from(onlineUsers).some(user => user.userId === userId))
        return Array.from(onlineUsers).some(user => user.userId === userId);
    };

    return (
      <div className="sidebar p-4  h-full w-full  overflow-y-auto no-scrollbar">
        <h2 className="text-lg font-bold mb-4 ">Users</h2>
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user._id}
              className={`user flex items-center p-2 rounded-lg cursor-pointer transition 
                            duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 ${
                              selectedUser === user._id ? "bg-gray-200 dark:bg-gray-700" : ""
                            }`}
              onClick={() => handleUserClick(user)}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={user.profile_picture}
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover border border-gray-300"
                />
                {isUserOnline(user._id) && (
                  <span className="absolute -right-1 -top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="flex flex-col flex-grow ml-3">
                <span className="font-medium  truncate max-w-[150px] sm:max-w-none">
                  {user.username}
                </span>
                {user.latestMessage ? (
                  <span className="text-sm  truncate max-w-[180px] sm:max-w-none">
                    {user.latestMessage.content}
                  </span>
                ) : (
                  <span className="text-sm ">No messages</span>
                )}
              </div>
              <div className="flex flex-col items-end ml-2">
                {user.latestMessage && (
                  <span className="text-xs ">
                    {formatTimestamp(user.latestMessage.timestamp)}
                  </span>
                )}
                {unreadCounts[user._id] > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 mt-1">
                    {unreadCounts[user._id]}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
};

export default Sidebar;
