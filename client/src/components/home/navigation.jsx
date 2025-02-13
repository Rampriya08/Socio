import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { SunIcon, ChatBubbleLeftEllipsisIcon, BellIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate(); // Initialize navigate
    const user = JSON.parse(localStorage.getItem("user"));

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem("user"); // Remove user data from localStorage
        navigate("/"); // Redirect to the home page
    };
    const handleMessage=() =>{
        navigate("/chat");
    }

    return (
        <nav className="bg-white shadow-md p-4 flex justify-between items-center">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold">MERN Social Media</h1>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-gray-100 p-2 pl-4 rounded-full text-sm focus:outline-none"
                    />
                    <button className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-4 h-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-4.35-4.35m2.85-6.9a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
                <button className="text-gray-600 hover:text-gray-800">
                    <SunIcon className="w-6 h-6" />
                </button>
                <button className="text-gray-600 hover:text-gray-800" onClick={handleMessage}>
                    <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
                </button>
                <button className="text-gray-600 hover:text-gray-800">
                    <BellIcon className="w-6 h-6" />
                </button>
                <button className="text-gray-600 hover:text-gray-800">
                    <QuestionMarkCircleIcon className="w-6 h-6" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        className="text-gray-700 font-medium"
                        onClick={toggleDropdown}
                    >
                        {user.username} ▾
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg">
                            <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                                {user.username}
                            </button>
                            <button
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                onClick={handleLogout} // Handle logout on click
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
