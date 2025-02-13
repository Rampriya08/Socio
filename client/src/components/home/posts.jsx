import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { HeartIcon, ChatBubbleOvalLeftIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

const Posts = ({ posts, setPosts, onFollowUpdate,onLikeUpdate }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [userProfiles, setUserProfiles] = useState({});
    const [followingList, setFollowingList] = useState([user.username]);

    // Fetch initial posts and user's following list
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/posts/");
                setPosts(response.data);

                const uniqueUsernames = [...new Set(response.data.map((post) => post.username))];
                const profileMap = await fetchUserProfilePics(uniqueUsernames);
                setUserProfiles(profileMap);

                if (user) {
                    const followingResponse = await axios.get(
                        `http://localhost:5000/api/user/${user.username}/following`
                    );
                    setFollowingList((prev) => {
                        const newFollowing = followingResponse.data.filter(
                            (username) => !prev.includes(username)
                        );
                        return [...prev, ...newFollowing];
                    });
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchPosts();
    }, []);


    // Function to fetch profile pictures for multiple usernames
    const fetchUserProfilePics = async (usernames) => {
        const profileRequests = usernames.map(async (username) => {
            if (userProfiles[username]) {
                return { username, profile_pic: userProfiles[username] };
            }
            try {
                const response = await axios.get(`http://localhost:5000/api/user/${username}`);
                return { username, profile_pic: response.data.profile_pic };
            } catch (error) {
                console.error(`Error fetching profile for ${username}:`, error);
                return { username, profile_pic: "https://via.placeholder.com/50" }; // Default image
            }
        });

        const profiles = await Promise.all(profileRequests);
        return profiles.reduce((acc, profile) => {
            acc[profile.username] = profile.profile_pic;
            return acc;
        }, {});
    };


    // Handle the Like button click
    const handleLike = async (postId) => {
        

        if (!user || !user.username) {
            console.error("User not logged in or username missing.");
            alert("Please log in to like posts.");
            return; // Exit the function if the user is not valid
        }

        try {
            await axios.post(`http://localhost:5000/api/posts/${postId}/like`, {
                username: user.username, // Pass the username of the logged-in user
            });
            // Update the state to reflect the new like count
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === postId ? { ...post, likes_count: post.likes_count + 1 } : post
                )
            );
            onLikeUpdate()
        } catch (error) {
            console.error("Error liking the post:", error.response?.data || error.message);
            alert("An error occurred while liking the post.");
        }
    };


    // Handle the Follow button click
    const handleFollow = async (username) => {
        try {
            if (!user) {
                alert("User not logged in");
                return;
            }

            const response = await axios.post(`http://localhost:5000/api/user/${username}/follow`, {
                userId: user.id,
            });

            alert(response.data.message);
            setFollowingList((prev) => [...prev, username]);
            onFollowUpdate();
        } catch (error) {
            console.error(`Error following ${username}:`, error);
            alert(
                error.response?.data?.message ||
                "An error occurred while trying to follow the user."
            );
        }
    };


    useEffect(() => {
        console.log("Updated following list:", followingList);
      

    }, [followingList]);



    return (
        <div className="flex flex-col h-screen overflow-auto">
            {posts.map((post) => (
                <div key={post._id} className="bg-gray-50 p-4 rounded-lg mb-6 shadow">
                    {/* Post Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <img
                                src={userProfiles[post.username] || "https://via.placeholder.com/50"}
                                alt={post.username}
                                className="w-12 h-12 rounded-full"
                            />
                            <p className="font-bold">{post.username}</p>
                        </div>
                        {!followingList?.includes(post.username) && post.username !== user.username && (
                            <button
                                onClick={() => handleFollow(post.username)}
                                className="text-sm font-semibold bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600"
                            >
                                Follow
                            </button>
                        )}
                    </div>

                    {/* Post Image */}
                    <img
                        src={`http://localhost:5000${post.image_url}`}
                        alt="Post"
                        className="rounded-lg w-full max-h-[350px] object-cover"
                    />

                    {/* Post Caption */}
                    <p className="mt-4 text-gray-600">{post.caption}</p>

                    {/* Post Footer */}
                    <div className="mt-4 flex items-center space-x-6">
                        <button
                            onClick={() => handleLike(post._id)}
                            className="flex items-center space-x-2 text-gray-500 hover:text-gray-800"
                        >
                            <HeartIcon className="h-6 w-6" />
                            <p>{post.likes_count} Likes</p>
                        </button>

                        <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-800">
                            <ChatBubbleOvalLeftIcon className="h-6 w-6" />
                            <p>Comment</p>
                        </button>

                        <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-800">
                            <PaperAirplaneIcon className="h-6 w-6" />
                            <p>Share</p>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Posts;

