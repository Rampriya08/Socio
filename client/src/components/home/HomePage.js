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
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

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
    <div className="h-screen flex flex-col overflow-hidden bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="flex flex-col md:flex-row flex-1 p-4 gap-4 overflow-hidden">
        {/* Main Content */}
        <div className="w-full md:w-1/2 p-4 md:p-6 rounded-lg shadow-md flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-800">
          <div className="m-4">
            <CreatePost onPostCreated={handlePostCreated} />
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
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
        <div className="w-full md:w-1/2 p-4 md:p-6 rounded-lg shadow-md flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-800">
          <div className="flex-1 overflow-y-auto min-h-0">
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
