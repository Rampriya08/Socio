import React, { useEffect, useState } from "react";
import Chatting from "./chatting"; // Ensure you import correctly
import Sidebar from "./sideBar";  // Ensure you import correctly
import Navbar from "../home/navigation";

const Chat = () => {
    const [selectedUser, setSelectedUser] = useState(null); // Tracks the selected user
    const [unread, setUnread] = useState(null); // Tracks the selected user

    useEffect(() => {
        console.log("Updated selectedUser:", selectedUser); // Debugging selectedUser updates
    }, [selectedUser]);

    return (
      <>
      <Navbar />
        <div className="flex h-screen w-full">
          {/* Sidebar */}
          <div className="w-1/4">
            <Sidebar onUserSelect={setSelectedUser} onUnread={setUnread} />
          </div>

          {/* Chat Area */}
          <div className="w-3/4 ">
            {selectedUser ? (
              <Chatting selectedUser={selectedUser} unread={unread || 0} />
            ) : (
              <div className="flex items-center justify-center h-full w-full text-gray-500">
                Select a user to start chatting
              </div>
            )}
          </div>
        </div>
      </>
    );
};

export default Chat;
