import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreatePost from "./createPost";
import Posts from "./posts";
import UserProfile from "./userProfile";
import Navbar from "./navigation";

const Home = () => {
  const navigate = useNavigate();
  const [refreshProfile, setRefreshProfile] = useState(0);
  const [posts, setPosts] = useState([]);
  const [refreshPost, setRefreshPost] = useState(0);


  // Callback for when a post is created
  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
    setRefreshProfile((prev) => prev + 1);
  };

  // Callback for when a follow action occurs
  const handleFollowUpdate = () => {
    setRefreshProfile((prev) => prev + 1);
    setRefreshPost((prev) => prev + 1);
  };

  const handleLikeUpdate = () => {
    setRefreshProfile((prev) => prev + 1);
    setRefreshPost((prev) => prev + 1);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="flex flex-col md:flex-row flex-1  gap-4 overflow-hidden">
        {/* Main Content */}
        <div className="w-full md:w-1/2  rounded-lg shadow-md flex p-2 flex-col overflow-hidden bg-gray-100 dark:bg-gray-900">
          <div className=" my-2 w-full">
            <CreatePost onPostCreated={handlePostCreated} />
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar ">
            <Posts
              posts={posts}
              setPosts={setPosts}
              refreshTrigger={refreshPost}
              onFollowUpdate={handleFollowUpdate}
              onLikeUpdate={handleLikeUpdate}
            />
          </div>
        </div>

        {/* User Profile Section */}
        <div className="w-full h-full md:w-1/2  rounded-lg shadow-md flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-900">
          <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar">
            <UserProfile
              refreshTrigger={refreshProfile}
              onFollowUpdate={handleFollowUpdate}
              onLikeUpdate={handleLikeUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
