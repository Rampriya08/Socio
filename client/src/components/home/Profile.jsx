import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  HeartIcon as HeartOutline,
  ChatBubbleOvalLeftIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid"; 
import Navbar from "./navigation";
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
        const user = JSON.parse(localStorage.getItem("user"));

    const { userId } = useParams();
    const navigate = useNavigate();

    // Fetch logged-in user from localStorage and their following list
    useEffect(() => {
        if (user) {
            setLoggedInUser(user);
            fetchUserFollowingList(user.username);
            fetchFollowers();
            fetchFollowing();
        } else {
            setError("User not logged in.");
        }
    }, []);
const fetchFollowers = async () => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/user/${userId}/followers`
    );
    setFollowers(response.data);
    fetchProfilePictures(response.data);
  } catch (error) {
    console.error("Error updating like status:", error);
    toast.error("Something went wrong. Try again.");
  }
};
const fetchFollowing = async () => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/user/${userId}/following`
    );
    setFollowing(response.data);
    fetchProfilePictures(response.data);
  } catch (error) {
    console.error("Error updating like status:", error);
    toast.error("Something went wrong. Try again.");
  }
};
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
const handleLike = async (postId, isLiked) => {
  if (!user || !user.username) {
    console.error("User not logged in or username missing.");
    toast.error("Please log in to like posts.");
    return;
  }

  try {
    const url = `http://localhost:5000/api/posts/${postId}/${
      isLiked ? "unlike" : "like"
    }`;
    // console.log(user.username)
    await axios.post(url, { username: user.username });

    // Update the state to reflect like/unlike
    setUserPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? {
              ...post,
              isLiked: !isLiked,
              likes_count: isLiked
                ? post.likes_count - 1
                : post.likes_count + 1,
            }
          : post
      )
    );

    toast.success(isLiked ? "Post unliked!" : "Post liked!");
    
  } catch (error) {
    console.error("Error updating like status:", error);
    toast.error("Something went wrong. Try again.");
  }
};

// Handle the Follow button click
const handleFollowUnfollow = async (username) => {
  try {
    if (!user) {
      toast.error("User not logged in");
      return;
    }

    const isFollowing = userFollowingList.includes(username);
    const url = `http://localhost:5000/api/user/${username}/${
      isFollowing ? "unfollow" : "follow"
    }`;

    const response = await axios.post(url, { userId: user.id });

    toast.success(response.data.message);

    // Update the following list dynamically
    setUserFollowingList((prev) =>
      isFollowing
        ? prev.filter((name) => name !== username)
        : [...prev, username]
    );

    
  } catch (error) {
    console.error(`Error following/unfollowing ${username}:`, error);
    toast.error("Error updating follow status");
  }
};
    const fetchProfileData = async (userId) => {
        setLoading(true);
        setError(null);

        try {
            const userResponse = await axios.get(`http://localhost:5000/api/user/get/${userId}`);
            setUserData(userResponse.data);

            if (activeTab === "posts") {
                const postsResponse = await axios.get(`http://localhost:5000/api/posts/${userId}/posts`);
                const postsWithLikes = postsResponse.data.map((post) => ({
                  ...post,
                  isLiked: post.liked_by.includes(user?.username),
                }));
                setUserPosts(postsWithLikes);

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
    

const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`); // Navigate to the profile page with the user ID
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
      <>
        <Navbar />
        <div className="p-4 max-w-4xl mx-auto">
          {/* Back Button and Profile Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={handleBack} className="text-lg">
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold">{userData.username}</h2>
            <div className="w-6">
              {/* Follow/Unfollow Button */}
              <button
                onClick={() => handleFollowUnfollow(userData.username)}
                className={`text-sm font-semibold px-4 py-1 rounded-md ${
                  userFollowingList.includes(userData.username)
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {userFollowingList.includes(userData.username)
                  ? "Unfollow"
                  : "Follow"}
              </button>
            </div>
          </div>

          {/* User Info Section */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-between text-center sm:text-left space-y-4 sm:space-y-0">
            <img
              src={
                userData.profile_picture || "https://via.placeholder.com/150"
              }
              alt="User profile"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-gray-300"
            />
            <div className="flex space-x-6 justify-center">
              <div>
                <p className="text-sm font-bold">{userPosts.length}</p>
                <p className="text-xs text-gray-500">posts</p>
              </div>
              <div>
                <p className="text-sm font-bold">{userData.followersCount}</p>
                <p className="text-xs text-gray-500">followers</p>
              </div>
              <div>
                <p className="text-sm font-bold">{userData.followingCount}</p>
                <p className="text-xs text-gray-500">following</p>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-4 text-center sm:text-left">
            <p className="text-sm text-gray-600">
              {userData.bio || "No bio available"}
            </p>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-t pt-4 flex justify-center sm:justify-start space-x-6">
            {["posts", "followers", "following"].map((tab) => (
              <button
                key={tab}
                className={`text-sm font-bold ${
                  activeTab === tab
                    ? "text-black border-b-2 border-black"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Display Content */}
          <div className="mt-4">
            {activeTab === "posts" &&
              userPosts.map((post) => (
                <div key={post.id} className="p-4 border rounded-md mt-2">
                  <div className="flex flex-col items-center justify-center text-center">
                    {/* Post Image */}
                    <img
                      src={`http://localhost:5000${post.image_url}`}
                      alt="Post"
                      className="rounded-lg w-1/2 h-auto"
                    />
                  </div>
                  <p className="mt-2 text-gray-600">{post.caption}</p>
                  <div className="mt-4 flex items-center space-x-6">
                    <button
                      className="flex items-center space-x-2 text-gray-500 hover:text-gray-800"
                      onClick={() => handleLike(post._id, post.isLiked)}
                    >
                      {post.isLiked ? (
                        <HeartSolid className="h-6 w-6 text-red-500" />
                      ) : (
                        <HeartOutline className="h-6 w-6" />
                      )}
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
                    const isLoggedInUser =
                      loggedInUser?.username === followerId;
                    console.log(loggedInUser.username, followerId);

                    return (
                      <div
                        key={followerId}
                        className="flex items-center justify-between mt-2 p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                      >
                        <div onClick={() => handleUserClick(followerId)}>
                          <div className="flex items-center">
                            <img
                              src={
                                profilePics[followerId] ||
                                "https://via.placeholder.com/50"
                              }
                              alt={followerId}
                              className="w-12 h-12 rounded-full mr-4"
                            />
                            <div>
                              <p className="font-medium">{followerId}</p>
                            </div>
                          </div>
                        </div>

                        {/* Show follow button only if it's not the logged-in user and they are not already following */}
                        {!isLoggedInUser && !isFollowing && (
                          <button
                            onClick={() => handleFollowUnfollow(follower)}
                            className={`text-sm font-semibold px-4 py-1 rounded-md ${
                              userFollowingList.includes(follower)
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                          >
                            {userFollowingList.includes(follower)
                              ? "Unfollow"
                              : "Follow"}
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
                    const isLoggedInUser =
                      loggedInUser?.username === followingUser;
                    const isFollowing = isUserFollowed(followingUser);

                    return (
                      <div
                        key={followingUser}
                        className="flex items-center justify-between mt-2 p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                      >
                        {" "}
                        <div onClick={() => handleUserClick(followingUser)}>
                          <div className="flex items-center">
                            <img
                              src={
                                profilePics[followingUser] ||
                                "https://via.placeholder.com/50"
                              }
                              alt={followingUser}
                              className="w-12 h-12 rounded-full mr-4"
                            />
                            <div>
                              <p className="font-medium">{followingUser}</p>
                            </div>
                          </div>
                        </div>
                        {/* Show follow button only if not already following and not the logged-in user */}
                        {!isLoggedInUser && !isFollowing && (
                          <button
                            onClick={() => handleFollowUnfollow(followingUser)}
                            className={`text-sm font-semibold px-4 py-1 rounded-md ${
                              userFollowingList.includes(followingUser)
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                          >
                            {userFollowingList.includes(followingUser)
                              ? "Unfollow"
                              : "Follow"}
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
      </>
    );
};

export default ProfilePage;