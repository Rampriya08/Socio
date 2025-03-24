import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  SunIcon,
  MoonIcon,
  ChatBubbleLeftEllipsisIcon,
  BellIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const user = JSON.parse(localStorage.getItem("user")) || {
    username: "Guest",
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleThemeToggle = () => {
    setDarkMode((prevMode) => !prevMode);
    console.log("Dark Mode:", !darkMode);
  };

  return (
    <nav className="p-4 flex justify-between items-center shadow-md transition-all bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          className="text-3xl font-extrabold text-transparent bg-clip-text 
                     bg-gradient-to-r from-blue-500 to-purple-500 hover:underline transition"
          onClick={() => navigate("/home")}
        >
          MERN Social Media
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="p-2 pl-4 rounded-full text-sm focus:outline-none bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
          />
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
        <button className="hover:text-gray-500">
          <BellIcon className="w-6 h-6" />
        </button>
        <button className="hover:text-gray-500">
          <QuestionMarkCircleIcon className="w-6 h-6" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
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
