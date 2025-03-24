import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {  HeartIcon as HeartOutline, ChatBubbleOvalLeftIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid"; 
const Posts = ({ posts, setPosts,refreshTrigger, onFollowUpdate,onLikeUpdate }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [userProfiles, setUserProfiles] = useState({});
    const [followingList, setFollowingList] = useState([user.username]);
    // Fetch initial posts and user's following list
    useEffect(() => {
      console.log("refreshTrigger changed:", refreshTrigger);
      fetchPosts();
    }, [refreshTrigger]);
    

const fetchPosts = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/posts/");
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
        `http://localhost:5000/api/user/${user.username}/following`
      );
    
      setFollowingList( followingResponse.data);
      console.log(followingList,"--",user.username)
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};


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
     await axios.post(url, { username: user.username });

     // Update the state to reflect like/unlike
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

     toast.success(isLiked ? "Post unliked!" : "Post liked!");
     onLikeUpdate();
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

        const isFollowing = followingList.includes(username);
        const url = `http://localhost:5000/api/user/${username}/${
          isFollowing ? "unfollow" : "follow"
        }`;

        const response = await axios.post(url, { userId: user.id });

        toast.success(response.data.message);

        // Update the following list dynamically
        setFollowingList((prev) =>
          isFollowing
            ? prev.filter((name) => name !== username)
            : [...prev, username]
        );

        onFollowUpdate();
      } catch (error) {
        console.error(`Error following/unfollowing ${username}:`, error);
        toast.error("Error updating follow status");
      }
    };



   

const handleUserClick = (userId) => {
  navigate(`/profile/${userId}`); // Navigate to the profile page with the user ID
};

    return (
      <div className="flex  max-h-screen flex-col w-full">
        {posts.map((post) => (
          <div
            key={post._id}
            className="bg-white p-4 shadow-md rounded-lg mb-4 w-full"
          >
            {/* Post Header */}
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50">
              <div onClick={() => handleUserClick(post.username)}>
                <div className="flex items-center space-x-2">
                  <img
                    src={
                      userProfiles[post.username] ||
                      "https://via.placeholder.com/50"
                    }
                    alt={post.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <p className="font-semibold">{post.username}</p>
                </div>
              </div>
              {post.username !== user.username && (
                <button
                  onClick={() => handleFollowUnfollow(post.username)}
                  className={`text-sm font-semibold px-4 py-1 rounded-md ${
                    followingList.includes(post.username)
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {followingList.includes(post.username)
                    ? "Unfollow"
                    : "Follow"}
                </button>
              )}
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              {/* Post Image */}
              <img
                src={`http://localhost:5000${post.image_url}`}
                alt="Post"
                className="rounded-lg w-1/2 h-auto"
              />
            </div>
            {/* Post Caption */}
            <p className="mt-2 text-gray-600">{post.caption}</p>

            {/* Post Footer */}
            <div className="mt-2 flex items-center justify-between">
              <button
                onClick={() => handleLike(post._id, post.isLiked)}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-500"
              >
                {post.isLiked ? (
                  <HeartSolid className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartOutline className="h-6 w-6" />
                )}
                <p>{post.likes_count} Likes</p>
              </button>

              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                <ChatBubbleOvalLeftIcon className="h-6 w-6" />
                <p>Comment</p>
              </button>

              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
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

