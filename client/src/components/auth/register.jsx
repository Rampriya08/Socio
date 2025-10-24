import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import showToast from '../toast';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [gender, setGender] = useState('');
    const [bio, setBio] = useState("");
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            showToast("error","Passwords do not match");
            return;
        }

        const userData = { username, email, password, gender,bio };

        try {
            const response = await fetch("https://socio-gilt-two.vercel.app/api/user/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const result = await response.json();
            if (result.token && result.user) {
                // Store token and user data in localStorage
                localStorage.setItem("token", result.token);
                localStorage.setItem("user", JSON.stringify(result.user));

                showToast("success","Welcome , " + result.user.username + "!");
                navigate('/home'); // Redirect to home page
            } else {
                showToast("error","Register failed: Invalid response from server.");
            }
        } catch (error) {
            console.error("Error registering user:", error);
        }
    };

    return (
      <div className="flex justify-center items-center min-h-screen  bg-white text-black dark:bg-gray-900 dark:text-white ">
        <div className="w-full max-w-md p-6 rounded-lg  bg-gray-100 text-black dark:bg-gray-700  hover:shadow-hover-right-bottom border-r-2 border-b-2 border-bh dark:hover:shadow-hover-right-bottom">
          <h2 className="text-2xl font-bold mb-4 center dark:text-white">
            Register
          </h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-bh"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-bh"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-bh"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-bh"
          />
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-2 mb-4 border text-gray-400 border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-bh"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            placeholder="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-bh"
          />
          <button
            onClick={handleRegister}
            className="w-full bg-bh text-white p-2 rounded"
          >
            {" "}
            Register
          </button>
          <br />
          <a href="/" className="text-bh mt-4 block text-center">
            Already have an account? Login
          </a>
        </div>
      </div>
    );
};

export default Register;
