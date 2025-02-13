import {React,useState} from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import CreatePost from "./createPost";
import Posts from "./posts";
import UserProfile from "./userProfile";
import Navbar from "./navigation";

const Home = () => {
  const navigate = useNavigate();
  const [refreshProfile, setRefreshProfile] = useState(0);
  const [posts, setPosts] = useState([]); // Add state for posts

  // Callback for when a post is created
  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]); // Add new post to the beginning
    setRefreshProfile(prev => prev + 1);
  };
  // Callback for when a follow action occurs
  const handleFollowUpdate = () => {
    setRefreshProfile(prev => prev + 1);
  };
  const handleLikeUpdate = () => {
    setRefreshProfile(prev => prev + 1);
  };
  const handlePostSubmitClick = () => {
    navigate("/post");
  };


  return (
    <>
      <Navbar />
      <div className="flex h-screen">
        <div className="w-2/3 bg-white p-6 overflow-y-auto">
          <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow">
            <CreatePost onPostCreated={handlePostCreated} />
            <Posts
              posts={posts}
              setPosts={setPosts}
              onFollowUpdate={handleFollowUpdate}
              onLikeUpdate={handleLikeUpdate}
            />
          </div>
        </div>

        <div className="w-1/3 p-6">
          <UserProfile refreshTrigger={refreshProfile} />
        </div>
      </div>

    </>
  );
};

export default Home;
