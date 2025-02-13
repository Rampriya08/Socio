import React, { useState, useEffect } from "react";
import axios from "axios";
import { HeartIcon, ChatBubbleOvalLeftIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useNavigate } from 'react-router-dom';

const UserProfile = ({ refreshTrigger }) => {
    // State to manage the active tab and the data to display
    const [activeTab, setActiveTab] = useState("posts");
    const [userPosts, setUserPosts] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);
    const [profilePics, setProfilePics] = useState({});
    const userId = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();


    // Function to fetch profile picture for a given user
    useEffect(() => {
        if (userId && userId.id && userId.username) {
            fetchData(userId, activeTab);
        } else {
            setError("User not logged in or invalid user data.");
        }
    }, [activeTab, refreshTrigger]);
    const fetchProfilePic = async (username) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/user/${username}`);
            return response.data.profile_pic;
        } catch (error) {
            console.error(`Error fetching profile for ${username}:`, error);
            return "https://via.placeholder.com/50"; // Default image
        }
    };

    // Function to fetch profile pictures for followers and following
    const fetchProfilesForUsers = async (users) => {
        const updatedPics = {};
        for (const user of users) {
            const profilePic = await fetchProfilePic(user);
            updatedPics[user] = profilePic;
        }
        setProfilePics(updatedPics);
    };

    // Function to fetch data based on the active tab (posts, followers, or following)
    const fetchData = async (userId, activeTab) => {
        setLoading(true);
        setError(null);

        try {
            let response;



            const responses = await axios.get(`http://localhost:5000/api/user/get/${userId.username}`);
            setUserData(responses.data);

            switch (activeTab) {
                case "posts":
                    response = await axios.get(`http://localhost:5000/api/posts/${userId.username}/posts`);
                    setUserPosts(response.data);
                    break;
                case "followers":
                    response = await axios.get(`http://localhost:5000/api/user/${userId.username}/followers`);
                    setFollowers(response.data);
                    fetchProfilesForUsers(response.data);
                    break;
                case "following":
                    response = await axios.get(`http://localhost:5000/api/user/${userId.username}/following`);
                    setFollowing(response.data);
                    fetchProfilesForUsers(response.data);
                    break;
                default:
                    break;
            }
        } catch (err) {
            setError("Failed to load data. Please try again later.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId && userId.id && userId.username) {
            fetchData(userId, activeTab);
        } else {
            setError("User not logged in or invalid user data.");
        }
    }, [activeTab]);

    if (!userData) {
        return (
            <div className="p-4">
                <h2 className="text-lg text-red-500">Error: User not logged in.</h2>
                <p>Please log in to access your profile.</p>
            </div>
        );
    }
    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`); // Navigate to the profile page with the user ID
    };
    return (
        <div className="p-4">
            {/* User Profile Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{userData.username}</h2>
                <div className="flex items-center space-x-2">
                    <button className="text-sm font-semibold bg-gray-100 px-4 py-1 rounded-md">
                        Edit profile
                    </button>
                    <button className="text-lg">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4.5v15m7.5-7.5h-15"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* User Stats */}
            <div className="mt-6 flex items-center space-x-10">
                <div className="relative">
                    <img
                        src={userData.profile_picture || "https://via.placeholder.com/150"}
                        alt="User profile"
                        className="w-32 h-32 rounded-full border-2 border-gray-300"
                    />
                </div>
                <div>
                    <div className="flex space-x-8">
                        <div className="text-center">
                            <p className="text-sm font-bold">{userPosts.length}</p>
                            <p className="text-xs text-gray-500">posts</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold">{userData.followersCount}</p>
                            <p className="text-xs text-gray-500">followers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold">{userData.followingCount}</p>
                            <p className="text-xs text-gray-500">following</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bio Section */}
            <div className="mt-4">
                <p className="font-semibold">{userData.bioTitle || "No Title"}</p>
                <p className="text-sm text-gray-600">{userData.bio || "No bio available"}</p>
            </div>

            {/* Tabs Section */}
            <div className="mt-6 border-t pt-4 flex space-x-6">
                <button
                    className={`text-sm font-bold ${activeTab === "posts" ? "text-black border-b-2 border-black" : "text-gray-600"}`}
                    onClick={() => setActiveTab("posts")}
                >
                    POSTS
                </button>
                <button
                    className={`text-sm ${activeTab === "followers" ? "text-black border-b-2 border-black" : "text-gray-600"}`}
                    onClick={() => setActiveTab("followers")}
                >
                    Followers
                </button>
                <button
                    className={`text-sm ${activeTab === "following" ? "text-black border-b-2 border-black" : "text-gray-600"}`}
                    onClick={() => setActiveTab("following")}
                >
                    Following
                </button>
            </div>

            {/* Loading and Error Handling */}
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}

            {/* Content Section based on active tab */}
            <div className="mt-4">
                {activeTab === "posts" && (
                    <div>
                        {userPosts.length > 0 ? (
                            userPosts.map((post) => (
                                <div key={post.id} className="mt-2 p-4 border border-gray-200 rounded-md">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={userData.profile_picture}
                                                alt={post.username}
                                                className="w-12 h-12 rounded-full"
                                            />
                                            <p className="font-bold">{post.username}</p>
                                        </div>
                                    </div>

                                    {/* Post Image */}
                                    <img
                                        src={`http://localhost:5000${post.image_url}`}
                                        alt="Post"
                                        className="rounded-lg w-full max-h-[350px] object-cover"
                                    />

                                    {/* Post Caption */}
                                    <p className="mt-4 text-gray-600">{post.caption}</p>

                                    {/* Post Footer with Icons */}
                                    <div className="mt-4 flex items-center space-x-6">
                                        <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-800">
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
                            ))
                        ) : (
                            <p>No posts available.</p>
                        )}
                    </div>
                )}

                {activeTab === "followers" && (
                    <div>
                        <h3 className="text-lg font-semibold">Followers</h3>
                        {followers.length > 0 ? (
                            followers.map((follower) => (
                                <div
                                    key={follower}
                                    className="flex items-center mt-2 p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleUserClick(follower)} // Navigate on click
                                >
                                    <img
                                        src={profilePics[follower] || "https://via.placeholder.com/50"}
                                        alt={follower}
                                        className="w-12 h-12 rounded-full mr-4"
                                    />
                                    <div>
                                        <p className="font-medium">{follower}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No followers found.</p>
                        )}
                    </div>
                )}

                {activeTab === "following" && (
                    <div>
                        <h3 className="text-lg font-semibold">Following</h3>
                        {following.length > 0 ? (
                            following.map((followedUser) => (
                                <div
                                    key={followedUser}
                                    className="flex items-center mt-2 p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleUserClick(followedUser)} // Navigate on click
                                >
                                    <img
                                        src={profilePics[followedUser] || "https://via.placeholder.com/50"}
                                        alt={followedUser}
                                        className="w-12 h-12 rounded-full mr-4"
                                    />
                                    <div>
                                        <p className="font-medium">{followedUser}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No users followed.</p>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default UserProfile;
