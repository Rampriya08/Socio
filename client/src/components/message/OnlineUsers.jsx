import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const useOnlineUsers = () => {
    const [onlineUsers, setOnlineUsers] = useState([]);
    const socketRef = { current: null };
    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io('https://socio-gilt-two.vercel.app');

        // Connect user
        if (loggedInUser) {
            socketRef.current.emit('userConnected', {
                userId: loggedInUser.id,
                username: loggedInUser.username
            });
        }

        // Listen for user status updates
        socketRef.current.on('userStatusUpdate', ({ users }) => {
           //console.log(JSON.stringify(users))
            setOnlineUsers(prevOnlineUsers => {
                // Assuming `users` is an object where keys are user IDs
                // and values are user details
                return users;
            });

        });

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);
   

    // Return only the Set of online user IDs
    return onlineUsers;
};

export default useOnlineUsers;