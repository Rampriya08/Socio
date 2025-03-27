import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  SunIcon,
  MoonIcon,
  ChatBubbleLeftEllipsisIcon,
  BellIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const Navbar = ({ darkMode, setDarkMode }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {
    username: "Guest",
  };

  const handleThemeToggle = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // Fetch users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/user/s/search?q=${searchTerm}`
        );
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error(error);
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(() => fetchUsers(), 300); // Debounce to prevent excessive API calls
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return (
    <nav className="h-full flex justify-between items-center shadow-md transition-all bg-white text-black dark:bg-gray-900 dark:text-white">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          className="text-5xl griffy-text text-transparent bg-clip-text 
             bg-gradient-to-r from-bh-dark to-bh-light hover:underline transition px-4 font-extrabold"
          onClick={() => navigate("/home")}
        >
          TalkSpace
        </button>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            className="p-2 pl-4 rounded-full text-sm focus:outline-none bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Search Results Dropdown */}
          {searchTerm.trim() !== "" && (
            <div className="absolute top-10 left-0 w-full bg-white shadow-lg rounded-md dark:bg-gray-800 z-50">
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <button
                    key={result._id}
                    className="w-full text-left p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => navigate(`/profile/${result.username}`)}
                  >
                    {result.username}
                  </button>
                ))
              ) : (
                <p className="p-2 text-gray-500 dark:text-gray-400">
                  No results found
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        <button onClick={handleThemeToggle} className="hover:text-gray-500">
          {darkMode ? (
            <SunIcon className="w-6 h-6 text-yellow-400" />
          ) : (
            <MoonIcon className="w-6 h-6 text-gray-700" />
          )}
        </button>
        <button
          className="hover:text-gray-500"
          onClick={() => navigate("/chat")}
        >
          <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative pr-10">
          <button
            className="font-semibold"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {user.username} ▾
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
              <button className="block w-full px-4 py-2 text-left hover:bg-gray-200 dark:hover:bg-gray-700">
                {user.username}
              </button>
              <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => {
                  localStorage.removeItem("user");
                  navigate("/");
                }}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
