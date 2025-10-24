import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  HeartIcon as HeartOutline,
  ChatBubbleOvalLeftIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import showToast from '../toast';
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid"; 
import Navbar from "./navigation";
import { motion, AnimatePresence } from "framer-motion";

const ProfilePage = ({darkMode,setDarkMode}) => {
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
   
const tabVariants = {
  hidden: {
    opacity: 0,
    rotateX: -15,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
  visible: {
    opacity: 1,
    rotateX: 0,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Button animation variants with standard easing
const buttonVariants = {
  rest: {
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};
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
      `https://socio-gilt-two.vercel.app/api/user/${userId}/followers`
    );
    setFollowers(response.data);
    fetchProfilePictures(response.data);
  } catch (error) {
    console.error("Error updating like status:", error);
    showToast("error","Something went wrong. Try again.");
  }
};
const fetchFollowing = async () => {
  try {
    const response = await axios.get(
      `https://socio-gilt-two.vercel.app/api/user/${userId}/following`
    );
    setFollowing(response.data);
    fetchProfilePictures(response.data);
  } catch (error) {
    console.error("Error updating like status:", error);
    showToast("error","Something went wrong. Try again.");
  }
};
    // Fetch logged-in user's following list
    const fetchUserFollowingList = async (loggedInUserId) => {
        try {
            const response = await axios.get(`https://socio-gilt-two.vercel.app/api/user/${loggedInUserId}/following`);
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
    showToast("error","Please log in to like posts.");
    return;
  }

  try {
    const url = `https://socio-gilt-two.vercel.app/api/posts/${postId}/${
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

    showToast("success",isLiked ? "Post unliked!" : "Post liked!");
    
  } catch (error) {
    console.error("Error updating like status:", error);
    showToast("error","Something went wrong. Try again.");
  }
};

// Handle the Follow button click
const handleFollowUnfollow = async (username) => {
  try {
    if (!user) {
      showToast("error","User not logged in");
      return;
    }

    const isFollowing = userFollowingList.includes(username);
    const url = `https://socio-gilt-two.vercel.app/api/user/${username}/${
      isFollowing ? "unfollow" : "follow"
    }`;

    const response = await axios.post(url, { userId: user.id });

    showToast("error",response.data.message);

    // Update the following list dynamically
    setUserFollowingList((prev) =>
      isFollowing
        ? prev.filter((name) => name !== username)
        : [...prev, username]
    );

    
  } catch (error) {
    console.error(`Error following/unfollowing ${username}:`, error);
    showToast("error","Error updating follow status");
  }
};
    const fetchProfileData = async (userId) => {
        setLoading(true);
        setError(null);

        try {
            const userResponse = await axios.get(`https://socio-gilt-two.vercel.app/api/user/get/${userId}`);
            setUserData(userResponse.data);

            if (activeTab === "posts") {
                const postsResponse = await axios.get(`https://socio-gilt-two.vercel.app/api/posts/${userId}/posts`);
                const postsWithLikes = postsResponse.data.map((post) => ({
                  ...post,
                  isLiked: post.liked_by.includes(user?.username),
                }));
                setUserPosts(postsWithLikes);

            } else if (activeTab === "followers") {
                const followersResponse = await axios.get(`https://socio-gilt-two.vercel.app/api/user/${userId}/followers`);
                setFollowers(followersResponse.data);
                fetchProfilePictures(followersResponse.data);
            } else if (activeTab === "following") {
                const followingResponse = await axios.get(`https://socio-gilt-two.vercel.app/api/user/${userId}/following`);
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
            const response = await axios.get(`https://socio-gilt-two.vercel.app/api/user/${loggedInUserId}/mutual-followers/${profileUserId}`);
            setMutualFollowers(response.data);
        } catch (error) {
            console.error("Error fetching mutual followers:", error);
        }
    };
    const fetchProfilePictures = async (users) => {
        const profilePicsData = {};
        const profilePicPromises = users.map(async (user) => {
            try {
                const response = await axios.get(`https://socio-gilt-two.vercel.app/api/user/${user}`);
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
      <div className="max-h-screen h-[90vh]   bg-white text-black dark:bg-gray-900 dark:text-white overflow-y-auto no-scrollbar">
        <div className=" max-w-4xl mx-auto   rounded-lg  ">
          {/* Back Button and Profile Header */}
          <div className="flex items-center  mb-4 space-x-6">
            <button onClick={handleBack} className="text-lg">
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold">{userData.username}</h2>
            <div className="pl-[72vh]">
              <div className="w-6 ">
                {/* Follow/Unfollow Button */}
                <button
                  onClick={() => handleFollowUnfollow(userData.username)}
                  className={`text-sm font-semibold px-4 py-1 rounded-md  ${
                    userFollowingList.includes(userData.username)
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-bh text-white hover:bg-bh-dark"
                  }`}
                >
                  {userFollowingList.includes(userData.username)
                    ? "Unfollow"
                    : "Follow"}
                </button>
              </div>
            </div>
          </div>

          {/* User Info Section */}
          <div className="flex -4 flex-col sm:flex-row items-center px-10  text-center sm:text-left space-y-4 sm:space-y-0">
            <img
              src={
                userData.profile_picture || "https://via.placeholder.com/150"
              }
              alt="User profile"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full  "
            />
            <div className="flex space-x-6 px-40 justify-center space-x-14">
              <div>
                <p className="text-sm font-bold">{userPosts.length}</p>
                <p className="text-xs ">posts</p>
              </div>
              <div>
                <p className="text-sm font-bold">{userData.followersCount}</p>
                <p className="text-xs ">followers</p>
              </div>
              <div>
                <p className="text-sm font-bold">{userData.followingCount}</p>
                <p className="text-xs ">following</p>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-4 text-center sm:text-left px-10">
            <p className="text-sm ">{userData.bio || "No bio available"}</p>
          </div>

          {/* Tabs */}
          {/* Tab Buttons with Wave Effect */}
          <div className="container mx-auto px-4">
            <div className="mt-6 pt-4 flex justify-between items-center text-center  space-x-6">
              {["posts", "followers", "following"].map((tab) => (
                <motion.button
                  key={tab}
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className={`center text-sm font-bold pb-2  transition-all duration-300 ${
                    activeTab === tab
                      ? "text-bh font-extrabold"
                      : "text-black dark:text-white hover:text-bh"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.toUpperCase()}
                  {activeTab === tab && <motion.div />}
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="mt-8 w-full "
              >
                <div className="h-full">
                  <div className="mt-4 w-full max-w-full shadow-lg rounded-lg p-4 ">
                    {activeTab === "posts" && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{
                          duration: 0.3,
                          ease: "easeInOut",
                        }}
                        className="w-full"
                      >
                        <div className="grid grid-cols-1 gap-4 w-full ">
                          {userPosts.length > 0 ? (
                            userPosts.map((post) => (
                              <div
                                key={post._id}
                                className="w-full p-4 rounded-md bg-white text-black dark:bg-gray-800 hover:shadow-hover-right-bottom border-r-2 border-b-2 border-bh dark:hover:shadow-hover-right-bottom dark:text-white"
                              >
                                <div className="flex items-center space-x-4 mb-2">
                                  <img
                                    src={userData.profile_picture}
                                    alt={post.username}
                                    className="w-10 h-10 rounded-full"
                                  />
                                  <p className="font-bold">{post.username}</p>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center w-full">
                                  {/* Post Image */}
                                  <img
                                    src={`https://socio-gilt-two.vercel.app${post.image_url}`}
                                    alt="Post"
                                    className="rounded-lg w-1/2 h-1/2"
                                  />
                                </div>
                                <p className="mt-2 w-full">{post.caption}</p>
                                <div className="mt-4 flex justify-between w-full">
                                  <button
                                    onClick={() =>
                                      handleLike(post._id, post.isLiked)
                                    }
                                    className="flex items-center space-x-1 hover:text-red-500"
                                  >
                                    {post.isLiked ? (
                                      <HeartSolid className="h-6 w-6 text-red-500" />
                                    ) : (
                                      <HeartOutline className="h-6 w-6" />
                                    )}
                                    <p>{post.likes_count} Likes</p>
                                  </button>
                                  <button className="hover:text-bh">
                                    <ChatBubbleOvalLeftIcon className="h-6 w-6 inline-block" />{" "}
                                    Comment
                                  </button>
                                  <button className="hover:text-bh">
                                    <PaperAirplaneIcon className="h-6 w-6 inline-block" />{" "}
                                    Share
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center w-full">
                              No posts available.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>{" "}
                  {/* Single column */}
                  {activeTab === "followers" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                      className="w-full"
                    >
                      <div className="grid grid-cols-1 gap-4 w-full">
                        {followers.length > 0 ? (
                          followers.map((follower) => (
                            <div
                              key={follower}
                              className="w-full flex items-center justify-between p-4 rounded-md cursor-pointer bg-white text-black dark:bg-gray-800 dark:text-white dark:hover:bg-gray-800 transition duration-300 hover:shadow-hover-right-bottom border-r-2 border-b-2 border-bh dark:hover:shadow-hover-right-bottom"
                            >
                              <div className="w-full flex items-center justify-between">
                                <div onClick={() => handleUserClick(follower)}>
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={
                                        profilePics[follower] ||
                                        "https://via.placeholder.com/50"
                                      }
                                      alt={follower}
                                      className="w-12 h-12 rounded-full"
                                    />
                                    <p className="font-medium text-base">
                                      {follower}
                                    </p>
                                  </div>
                                </div>
                                {follower != loggedInUser.username ? (
                                  <button
                                    onClick={() =>
                                      handleFollowUnfollow(follower)
                                    }
                                    className={`text-sm font-semibold px-4 py-1 rounded-md ${
                                      userFollowingList.includes(follower)
                                        ? "bg-red-500 text-white "
                                        : "bg-bh  text-white dark:bg-bh-dark "
                                    }`}
                                  >
                                    {userFollowingList.includes(follower)
                                      ? "Unfollow"
                                      : "Follow"}
                                  </button>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center w-full">
                            No followers found.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                  {activeTab === "following" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                      className="w-full"
                    >
                      <div className="grid grid-cols-1 gap-4 w-full">
                        {following.length > 0 ? (
                          following.map((followedUser) => (
                            <div
                              key={followedUser}
                              className="w-full flex items-center justify-between p-4 rounded-md cursor-pointer bg-white text-black dark:bg-gray-800 dark:text-white transition duration-300 hover:shadow-hover-right-bottom border-r-2 border-b-2 border-bh dark:hover:shadow-hover-right-bottom"
                            >
                              <div className="w-full flex items-center justify-between">
                                <div
                                  onClick={() => handleUserClick(followedUser)}
                                >
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={
                                        profilePics[followedUser] ||
                                        "https://via.placeholder.com/50"
                                      }
                                      alt={followedUser}
                                      className="w-12 h-12 rounded-full"
                                    />
                                    <p className="font-medium text-base">
                                      {followedUser}
                                    </p>
                                  </div>
                                </div>
                                {followedUser != loggedInUser.username ? (
                                  <button
                                    onClick={() =>
                                      handleFollowUnfollow(followedUser)
                                    }
                                    className={`text-sm font-semibold px-4 py-1 rounded-md ${
                                      userFollowingList.includes(followedUser)
                                        ? "bg-red-500 text-white "
                                        : "bg-bh  text-white dark:bg-bh-dark "
                                    }`}
                                  >
                                    {userFollowingList.includes(followedUser)
                                      ? "Unfollow"
                                      : "Follow"}
                                  </button>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center w-full text-gray-500">
                            No following yet.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
};

export default ProfilePage;