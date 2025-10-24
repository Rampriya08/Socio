import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HeartIcon as HeartOutline,
  ChatBubbleOvalLeftIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import showToast from '../toast';
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

const Posts = ({
  posts,
  setPosts,
  refreshTrigger,
  onFollowUpdate,
  onLikeUpdate,
  darkMode,
}) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [userProfiles, setUserProfiles] = useState({});
  const [followingList, setFollowingList] = useState([user.username]);

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get("https://socio-gilt-two.vercel.app/api/posts/");
      const postsWithLikes = response.data.map((post) => ({
        ...post,
        isLiked: post.liked_by.includes(user?.username),
      }));
      setPosts(postsWithLikes);

      const uniqueUsernames = [
        ...new Set(response.data.map((post) => post.username)),
      ];
      const profileMap = await fetchUserProfilePics(uniqueUsernames);
      setUserProfiles(profileMap);

      if (user) {
        const followingResponse = await axios.get(
          `https://socio-gilt-two.vercel.app/api/user/${user.username}/following`
        );
        setFollowingList(followingResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchUserProfilePics = async (usernames) => {
    const profileRequests = usernames.map(async (username) => {
      if (userProfiles[username])
        return { username, profile_pic: userProfiles[username] };
      try {
        const response = await axios.get(
          `https://socio-gilt-two.vercel.app/api/user/${username}`
        );
        return { username, profile_pic: response.data.profile_pic };
      } catch (error) {
        return { username, profile_pic: "https://via.placeholder.com/50" };
      }
    });
    const profiles = await Promise.all(profileRequests);
    return profiles.reduce((acc, profile) => {
      acc[profile.username] = profile.profile_pic;
      return acc;
    }, {});
  };

  const handleLike = async (postId, isLiked) => {
    if (!user || !user.username) {
      showToast("error","Please log in to like posts.");
      return;
    }
    try {
      const url = `https://socio-gilt-two.vercel.app/api/posts/${postId}/${
        isLiked ? "unlike" : "like"
      }`;
      await axios.post(url, { username: user.username });
      setPosts((prevPosts) =>
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
      showToast("error","Something went wrong. Try again.");
    }
  };

  const handleFollowUnfollow = async (username) => {
    if (!user) {
      showToast("error","User not logged in");
      return;
    }
    try {
      const isFollowing = followingList.includes(username);
      const url = `https://socio-gilt-two.vercel.app/api/user/${username}/${
        isFollowing ? "unfollow" : "follow"
      }`;
      const response = await axios.post(url, { userId: user.id });
      showToast("success",response.data.message);
      setFollowingList((prev) =>
        isFollowing
          ? prev.filter((name) => name !== username)
          : [...prev, username]
      );
      onFollowUpdate();
    } catch (error) {
      showToast("error","Error updating follow status");
    }
  };


  return (
    <div
      className={`flex max-h-screen rounded-lg ml-2  flex-col max-w-full mr-2 bg-white text-black dark:bg-gray-900 dark:text-white`}
    >
      {posts.map((post) => (
        <div
          key={post._id}
          className="p-4 w-full mr-2 border-r-2 border-b-2 border-bh  rounded-lg mb-4  bg-white  text-gray-900 dark:bg-gray-800 dark:text-gray-300    shadow-right-bottom hover:shadow-hover-right-bottom transition"
        >
          <div className="flex items-center justify-between cursor-pointer p-2 rounded-lg ">
            <div
              onClick={() => navigate(`/profile/${post.username}`)}
              className="flex items-center space-x-2"
            >
              <img
                src={
                  userProfiles[post.username] ||
                  "https://via.placeholder.com/50"
                }
                alt={post.username}
                className="w-10 h-10 rounded-full border"
              />
              <p className="font-semibold">{post.username}</p>
            </div>
            {post.username !== user.username && (
              <button
                onClick={() => handleFollowUnfollow(post.username)}
                className={`text-sm font-semibold px-4 py-1 rounded-md ${
                  followingList.includes(post.username)
                    ? "bg-red-500 text-white "
                    :  "bg-bh  text-white dark:bg-bh-dark "
                }`}
              >
                {followingList.includes(post.username) ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <img
              src={`https://socio-gilt-two.vercel.app${post.image_url}`}
              alt="Post"
              className="rounded-lg w-1/2 h-auto border"
            />
          </div>
          <p className="mt-2">{post.caption}</p>
          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={() => handleLike(post._id, post.isLiked)}
              className="flex items-center space-x-1"
            >
              {post.isLiked ? (
                <HeartSolid className="h-6 w-6 text-red-500" />
              ) : (
                <HeartOutline className="h-6 w-6" />
              )}
              <p>{post.likes_count} Likes</p>
            </button>
            <button className="flex items-center space-x-2">
              <ChatBubbleOvalLeftIcon className="h-6 w-6" />
              <p>Comment</p>
            </button>
            <button className="flex items-center space-x-2">
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