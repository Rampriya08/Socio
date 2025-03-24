import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, TextField, IconButton, Button, Typography } from "@mui/material";
import ClipIcon from "@mui/icons-material/Videocam";
import Dropzone from "react-dropzone";
import { useNavigate } from "react-router-dom";
import {
  useTheme,
} from "@mui/material";
import {
  Image as ImageIcon,
  AttachFile as AttachmentIcon,
  Mic as MicIcon,
} from "@mui/icons-material";

const CreatePost = ({ onPostCreated }) => {
    const navigate = useNavigate();
    const [text, setText] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [showDropzone, setShowDropzone] = useState(false);
    const [profilePic, setProfilePic] = useState("");
 const theme = useTheme();
 const isDarkMode = theme.palette.mode === "dark";

    useEffect(() => {
        const fetchUserProfile = async () => {
            const user = JSON.parse(localStorage.getItem("user")); // Get user from localStorage
            if (user) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/user/${user.username}`);
                    setProfilePic(response.data.profile_pic); // Assuming `profilePic` is the field for the image URL
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            }
        };
        fetchUserProfile();
    }, []);

    const handleFileUpload = (acceptedFiles) => {
        setSelectedFile(acceptedFiles[0]);
        setShowDropzone(false); // Hide the dropzone once a file is added
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        const formData = new FormData();
        formData.append("userId", user ? user.username : " ");
        formData.append("description", text);
        if (selectedFile) {
            formData.append("picture", selectedFile);
            formData.append("picturePath", selectedFile.name);
        }

        try {
            const response = await fetch(`http://localhost:5000/api/posts/add`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const newPost = await response.json();

            // Create a post object that matches the structure expected by the Posts component
            const formattedPost = {
                _id: newPost._id,
                username: user.username,
                caption: text,
                image_url: newPost.image_url,
                likes_count: 0,
                comments: [],
                created_at: new Date().toISOString()
            };

            // Call the callback with the new post data
            onPostCreated(formattedPost);

            // Reset form
            setText("");
            setSelectedFile(null);
            alert("Post created successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to create post. " + error);
        }
    };
    return (
      <Box
        sx={{
          border: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
          borderRadius: "8px",
          p: 2,
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: isDarkMode ? "#121212" : "#fff", // Dark mode background fix
          color: isDarkMode ? "#e0e0e0" : "#000", // Text color fix
        }}
      >
        {/* Input Section */}
        <Box display="flex" alignItems="center" mb={2}>
          <img
            src={profilePic}
            alt="profile"
            style={{
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              marginRight: "10px",
            }}
          />
          <TextField
            fullWidth
            placeholder="What's on your mind..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            sx={{
              borderRadius: "8px",
              backgroundColor: isDarkMode ? "#333" : "#f0f0f0",
              "& .MuiInputBase-input": {
                color: isDarkMode ? "#fff" : "#000", // Fix input text color
              },
            }}
          />
        </Box>

        {/* Conditional Dropzone */}
        {showDropzone && (
          <Dropzone onDrop={handleFileUpload}>
            {({ getRootProps, getInputProps }) => (
              <Box
                {...getRootProps()}
                sx={{
                  border: `1px dashed ${isDarkMode ? "#aaa" : "#ccc"}`,
                  borderRadius: "8px",
                  p: 2,
                  textAlign: "center",
                  mb: 2,
                  cursor: "pointer",
                  backgroundColor: isDarkMode ? "#444" : "#fafafa",
                }}
              >
                <input {...getInputProps()} />
                <Typography>Add Image Here</Typography>
              </Box>
            )}
          </Dropzone>
        )}

        {/* Display Uploaded File */}
        {selectedFile && (
          <Box
            sx={{
              border: `1px dashed ${isDarkMode ? "#aaa" : "#ccc"}`,
              borderRadius: "8px",
              p: 2,
              textAlign: "center",
              mb: 2,
              backgroundColor: isDarkMode ? "#444" : "#fafafa",
            }}
          >
            <Typography>{selectedFile.name}</Typography>
          </Box>
        )}

        {/* Actions */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <IconButton onClick={() => setShowDropzone(!showDropzone)}>
            <ImageIcon sx={{ color: isDarkMode ? "#e0e0e0" : "#000" }} />
          </IconButton>
          <IconButton>
            <AttachmentIcon sx={{ color: isDarkMode ? "#e0e0e0" : "#000" }} />
          </IconButton>
          <IconButton>
            <MicIcon sx={{ color: isDarkMode ? "#e0e0e0" : "#000" }} />
          </IconButton>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Post
          </Button>
        </Box>
      </Box>
    );
};

export default CreatePost;
