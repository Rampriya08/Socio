import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import showToast from '../toast';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Check localStorage for existing user and token
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            navigate('/home'); // Redirect to the home page
        }
    }, [navigate]);

    const handleLogin = async () => {
        const loginData = { username, password };
        try {
            const response = await fetch("http://localhost:5000/api/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginData),
            });

            const result = await response.json();
            if (result.token && result.user) {
                // Store token and user data in localStorage
                localStorage.setItem("token", result.token);
                localStorage.setItem("user", JSON.stringify(result.user));

                showToast("success","Welcome back, " + result.user.username + "!");
                navigate('/home'); // Redirect to home page
            } else {
                showToast("error","Login failed: Invalid response from server.");
            }
        } catch (error) {
            console.error("Error logging in:", error);
            showToast("error","An error occurred. Please try again.");
        }
    };

    return (
      <div className="flex justify-center items-center min-h-screen  bg-white text-black dark:bg-gray-900 dark:text-white ">
        <div className="w-full max-w-md p-6 rounded-lg  bg-gray-100 text-black dark:bg-gray-700 dark:text-white hover:shadow-hover-right-bottom border-r-2 border-b-2 border-bh dark:hover:shadow-hover-right-bottom">
          <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

          {/* Username Field */}
          <div className="mb-4">
            <label htmlFor="username" className="block ">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 mt-2 border  rounded-md focus:outline-none focus:ring-2 focus:ring-bh"
            />
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label htmlFor="password" className="block">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-2 border  rounded-md focus:outline-none focus:ring-2 focus:ring-bh"
            />
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-bh font-semibold rounded-lg  focus:outline-none focus:ring-2 focus:ring-bh"
          >
            Login
          </button>

          {/* Register Link */}
          <div className="mt-4 text-center">
            <a href="/register" className="text-bh hover:underline">
              Don't have an account? Register
            </a>
          </div>
        </div>
      </div>
    );
};

export default Login;
