import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import {
  HeartIcon as HeartOutline,
  ChatBubbleOvalLeftIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import showToast from '../toast';
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid"; 
import { motion, AnimatePresence } from "framer-motion";

const UserProfile = ({ refreshTrigger, onFollowUpdate, onLikeUpdate }) => {
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



  // Function to fetch profile picture for a given user
  useEffect(() => {
    if (userId && userId.id && userId.username) {
      fetchData(userId, activeTab);
      fetchFollowers();
      fetchFollowing();
    } else {
      setError("User not logged in or invalid user data.");
    }
  }, [activeTab, refreshTrigger]);
  const fetchFollowers= async()=>{
    try {
      const response = await axios.get(
        `https://socio-d0dd.onrender.com/api/user/${userId.username}/followers`
      );
      setFollowers(response.data);
      fetchProfilesForUsers(response.data);
    } catch (error) {
      console.error("Error updating like status:", error);
      showToast("error","Something went wrong. Try again.");
    }
  }
   const fetchFollowing  = async () => {
     try {
       const response = await axios.get(
         `https://socio-d0dd.onrender.com/api/user/${userId.username}/following`
       );
       setFollowing(response.data);
       fetchProfilesForUsers(response.data);
     } catch (error) {
       console.error("Error updating like status:", error);
       showToast("error","Something went wrong. Try again.");
     }
   };
  const fetchProfilePic = async (username) => {
    try {
      const response = await axios.get(
        `https://socio-d0dd.onrender.com/api/user/${username}`
      );
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
  const handleLike = async (postId, isLiked) => {
    if (!userId || !userId.username) {
      console.error("User not logged in or username missing.");
      showToast("error","Please log in to like posts.");
      return;
    }

    try {
      const url = `https://socio-d0dd.onrender.com/api/posts/${postId}/${
        isLiked ? "unlike" : "like"
      }`;
      await axios.post(url, { username: userId.username });

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
      onLikeUpdate();
    } catch (error) {
      console.error("Error updating like status:", error);
      showToast("error","Something went wrong. Try again.");
    }
  };

  // Handle the Follow button click
  const handleFollowUnfollow = async (username) => {
    try {
      if (!userId) {
        showToast("error","User not logged in");
        return;
      }

      const isFollowing = following.includes(username);
      const url = `https://socio-d0dd.onrender.com/api/user/${username}/${
        isFollowing ? "unfollow" : "follow"
      }`;

      const response = await axios.post(url, { userId: userId.id });

      showToast("success",response.data.message);

      // Update the following list dynamically
      setFollowing((prev) =>
        isFollowing
          ? prev.filter((name) => name !== username)
          : [...prev, username]
      );

      onFollowUpdate();
    } catch (error) {
      console.error(`Error following/unfollowing ${username}:`, error);
      showToast("error","Error updating follow status");
    }
  };

  // Function to fetch data based on the active tab (posts, followers, or following)
  const fetchData = async (userId, activeTab) => {
    setLoading(true);
    setError(null);

    try {
      let response;

      const responses = await axios.get(
        `https://socio-d0dd.onrender.com/api/user/get/${userId.username}`
      );
      setUserData(responses.data);

      switch (activeTab) {
        case "posts":
          response = await axios.get(
            `https://socio-d0dd.onrender.com/api/posts/${userId.username}/posts`
          );
          const postsWithLikes = response.data.map((post) => ({
            ...post,
            isLiked: post.liked_by.includes(userId?.username),
          }));
          setUserPosts(postsWithLikes);
          break;
        case "followers":
          response = await axios.get(
            `https://socio-d0dd.onrender.com/api/user/${userId.username}/followers`
          );
          setFollowers(response.data);
          fetchProfilesForUsers(response.data);
          break;
        case "following":
          response = await axios.get(
            `https://socio-d0dd.onrender.com/api/user/${userId.username}/following`
          );
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
    <div className="h-screen p-4 w-full  bg-gray-100 text-black dark:bg-gray-900 dark:text-white  ">
      {/* User Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:justify-between space-y-4 sm:space-y-0">
        <h2 className="text-lg sm:text-xl font-bold">{userData.username}</h2>
      </div>
      {/* User Stats */}
      <div className="mt-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-10   bg-gray-100 text-black dark:bg-gray-900 dark:text-white">
        <img
          src={userData.profile_picture || "https://via.placeholder.com/150"}
          alt="User profile"
          className="w-24 sm:w-32 h-24 sm:h-32 rounded-full"
        />
        <div className="flex justify-center sm:justify-start space-x-8">
          {[
            { label: "Posts", count: userPosts.length },
            { label: "Followers", count: userData.followersCount },
            { label: "Following", count: userData.followingCount },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-md font-bold">{item.count}</p>
              <p className="text-sm ">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Bio Section */}
      <div className="mt-4 text-center sm:text-left">
        <p className="text-md">{userData.bio || "No bio available"}</p>
      </div>

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
              {activeTab === tab && (
                <motion.div
                  layoutId="magical-underline"
                  className="absolute left-0 right-0 bottom-0 h-1 bg-gradient-to-r from-bh-light to-bh-dark"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                />
              )}
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
            className="mt-8 w-full"
          >
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
                              src={`https://socio-d0dd.onrender.com${post.image_url}`}
                              alt="Post"
                              className="rounded-lg w-1/2 h-1/2"
                            />
                          </div>
                          <p className="mt-2 w-full">{post.caption}</p>
                          <div className="mt-4 flex justify-between w-full">
                            <button
                              onClick={() => handleLike(post._id, post.isLiked)}
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
                      <p className="text-center w-full">No posts available.</p>
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
                          <button
                            onClick={() => handleFollowUnfollow(follower)}
                            className={`text-sm font-semibold px-4 py-1 rounded-md ${
                              following.includes(follower)
                                ? "bg-red-500 text-white "
                                : "bg-bh  text-white dark:bg-bh-dark "
                            }`}
                          >
                            {following.includes(follower)
                              ? "Unfollow"
                              : "Follow"}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center w-full">No followers found.</p>
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
                          <div onClick={() => handleUserClick(followedUser)}>
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
                          <button
                            className="text-sm font-semibold px-4 py-1 rounded-md bg-red-500 text-white transition duration-300"
                            onClick={() => handleFollowUnfollow(followedUser)}
                          >
                            Unfollow
                          </button>
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
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Loading & Error Handling */}
      {loading && <div className="text-center mt-4">Loading...</div>}
      {error && <div className="text-red-500 text-center mt-4">{error}</div>}
    </div>
  );
};

export default UserProfile;
