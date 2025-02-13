import React, { useState, useEffect } from "react";
import axios from "axios";
import { HeartIcon, ChatBubbleOvalLeftIcon, PaperAirplaneIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState("posts");
    const [userPosts, setUserPosts] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [mutualFollowers, setMutualFollowers] = useState([]);
    const [userData, setUserData] = useState(null);
    const [profilePics, setProfilePics] = useState({});
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userFollowingList, setUserFollowingList] = useState([]);

    const { userId } = useParams();
    const navigate = useNavigate();

    // Fetch logged-in user from localStorage and their following list
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setLoggedInUser(user);
            fetchUserFollowingList(user.username);
        } else {
            setError("User not logged in.");
        }
    }, []);

    // Fetch logged-in user's following list
    const fetchUserFollowingList = async (loggedInUserId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/user/${loggedInUserId}/following`);
            setUserFollowingList(response.data);
        } catch (error) {
            console.error("Error fetching user following list:", error);
        }
    };

    // Check if a user is being followed by logged-in user
    const isUserFollowed = (userId) => {
        return userFollowingList.includes(userId);
    };

    // Fetch user profile and related data
    useEffect(() => {
        if (userId) {
            fetchProfileData(userId);
        }
    }, [userId, activeTab]);

    const fetchProfileData = async (userId) => {
        setLoading(true);
        setError(null);

        try {
            const userResponse = await axios.get(`http://localhost:5000/api/user/get/${userId}`);
            setUserData(userResponse.data);

            if (activeTab === "posts") {
                const postsResponse = await axios.get(`http://localhost:5000/api/posts/${userId}/posts`);
                setUserPosts(postsResponse.data);
            } else if (activeTab === "followers") {
                const followersResponse = await axios.get(`http://localhost:5000/api/user/${userId}/followers`);
                setFollowers(followersResponse.data);
                fetchProfilePictures(followersResponse.data);
            } else if (activeTab === "following") {
                const followingResponse = await axios.get(`http://localhost:5000/api/user/${userId}/following`);
                setFollowing(followingResponse.data);
                fetchProfilePictures(followingResponse.data);
            }

            if (loggedInUser) {
                fetchMutualFollowers(loggedInUser.id, userId);
            }
        } catch (err) {
            setError("Failed to load data. Please try again later.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const fetchMutualFollowers = async (loggedInUserId, profileUserId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/user/${loggedInUserId}/mutual-followers/${profileUserId}`);
            setMutualFollowers(response.data);
        } catch (error) {
            console.error("Error fetching mutual followers:", error);
        }
    };
    const fetchProfilePictures = async (users) => {
        const profilePicsData = {};
        const profilePicPromises = users.map(async (user) => {
            try {
                const response = await axios.get(`http://localhost:5000/api/user/${user}`);
                profilePicsData[user] = response.data.profile_pic;
            } catch {
                profilePicsData[user] = "https://via.placeholder.com/50"; // Default profile picture
            }
        });

        await Promise.all(profilePicPromises);
        setProfilePics(profilePicsData);
    };
    // Handle follow/unfollow
    const handleFollow = async (username) => {
        try {
            if (!loggedInUser) {
                alert("User not logged in");
                return;
            }

            const response = await axios.post(`http://localhost:5000/api/user/${username}/follow`, {
                userId: loggedInUser.id,
            });

            alert(response.data.message);

            // Update the userFollowingList after successful follow
            await fetchUserFollowingList(loggedInUser.id);

            // Refresh the current tab data
            fetchProfileData(userId);
        } catch (error) {
            console.error(`Error following ${username}:`, error);
            alert(
                error.response?.data?.message ||
                "An error occurred while trying to follow the user."
            );
        }
    };


    // Handle back navigation
    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return <div className="p-4 text-center">Loading...</div>;
    }

    if (!userData) {
        return (
            <div className="p-4">
                <h2 className="text-lg text-red-500">Error: {error || "User not found."}</h2>
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Back Button and Profile Header */}
            <div className="flex items-center justify-between">
                <button onClick={handleBack} className="text-lg">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <h2 className="text-xl font-bold">{userData.username}</h2>
                <div className="w-6"></div>
            </div>

            {/* User Info */}
            <div className="mt-6 flex items-center space-x-10">
                <img
                    src={userData.profile_picture || "https://via.placeholder.com/150"}
                    alt="User profile"
                    className="w-32 h-32 rounded-full border-2 border-gray-300"
                />
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

            {/* Bio Section */}
            <div className="mt-4">
                <p className="font-semibold">{userData.bioTitle || "No Title"}</p>
                <p className="text-sm text-gray-600">{userData.bio || "No bio available"}</p>
            </div>

            {/* Mutual Followers */}
            {mutualFollowers.length > 0 && (
                <div className="mt-4">
                    <p className="text-sm text-gray-600">{mutualFollowers.length} mutual followers</p>
                </div>
            )}

            {/* Tabs */}
            <div className="mt-6 border-t pt-4 flex space-x-6">
                {["posts", "followers", "following"].map((tab) => (
                    <button
                        key={tab}
                        className={`text-sm font-bold ${activeTab === tab ? "text-black border-b-2 border-black" : "text-gray-600"}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Display Content */}
            <div className="mt-4">
                {activeTab === "posts" && userPosts.map((post) => (
                    <div key={post.id} className="p-4 border rounded-md mt-2">
                        <img src={`http://localhost:5000${post.image_url}`} alt="Post" className="w-full rounded-lg" />
                        <p className="mt-2 text-gray-600">{post.caption}</p>
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
                ))}

                {activeTab === "followers" && (
                    <div>
                        <h3 className="text-lg font-semibold">Followers</h3>
                        {followers.length > 0 ? (
                            followers.map((follower) => {
                                const followerId = follower?.id || follower;
                                const isFollowing = isUserFollowed(followerId);
                                const isLoggedInUser = loggedInUser?.username === followerId;
                                console.log(loggedInUser.username,followerId)

                                return (
                                    <div
                                        key={followerId}
                                        className="flex items-center justify-between mt-2 p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                                        onClick={() => navigate(`/profile/${followerId}`)}
                                    >
                                        <div className="flex items-center">
                                            <img
                                                src={profilePics[followerId] || "https://via.placeholder.com/50"}
                                                alt={followerId}
                                                className="w-12 h-12 rounded-full mr-4"
                                            />
                                            <div>
                                                <p className="font-medium">{followerId}</p>
                                            </div>
                                        </div>

                                        {/* Show follow button only if it's not the logged-in user and they are not already following */}
                                        {!isLoggedInUser && !isFollowing && (
                                            <button
                                                className="text-sm bg-blue-500 text-white px-4 py-1 rounded-md"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleFollow(followerId);
                                                }}
                                            >
                                                Follow
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p>No followers found.</p>
                        )}
                    </div>
                )}

                {activeTab === "following" && (
                    <div>
                        <h3 className="text-lg font-semibold">Following</h3>
                        {following.length > 0 ? (
                            following.map((followingUser) => {
                                const isLoggedInUser = loggedInUser?.username === followingUser;
                                const isFollowing = isUserFollowed(followingUser);
                                console.log(isFollowing)
                                return (
                                    <div
                                        key={followingUser}
                                        className="flex items-center justify-between mt-2 p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                                        onClick={() => navigate(`/profile/${followingUser}`)}
                                    >
                                        <div className="flex items-center">
                                            <img
                                                src={profilePics[followingUser] || "https://via.placeholder.com/50"}
                                                alt={followingUser}
                                                className="w-12 h-12 rounded-full mr-4"
                                            />
                                            <div>
                                                <p className="font-medium">{followingUser}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Show follow button only if not already following and not the logged-in user */}
                                        {
                                            !isLoggedInUser && !isFollowing && (
                                            <button
                                                className="text-sm bg-blue-500 text-white px-4 py-1 rounded-md"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleFollow(followingUser);
                                                }}
                                            >
                                                Follow
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p>No following found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;