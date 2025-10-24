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
import showToast from "../toast";

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
                    const response = await axios.get(`https://socio-gilt-two.vercel.app/api/user/${user.username}`);
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
        const response = await fetch(`https://socio-gilt-two.vercel.app/api/posts/add`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          // Handle error response properly
          const errorData = await response.json();
          throw new Error(errorData.message || "Something went wrong");
        }

        const newPost = await response.json();

        showToast("success", "Post created successfully!");

        if (newPost) {
          console.log(newPost);
          console.log(newPost.image_url);

          const formattedPost = {
            _id: newPost.post._id,
            username: user.username,
            caption: text,
            image_url: newPost.post.image_url,
            likes_count: 0,
            created_at: new Date().toISOString(),
          };

          setTimeout(() => {
            onPostCreated(formattedPost);
          }, 2000);
        }

        // Reset form
        setText("");
        setSelectedFile(null);
      } catch (error) {
        console.error(error);
        showToast("error", "Failed to create post: " + error.message);
      }
    };

    return (
      <Box className=" bg-white mr-2 ml-2  text-black dark:bg-gray-800 dark:text-white p-4 pt-8 rounded-lg shadow-right-bottom hover:shadow-hover-right-bottom transition border-r-2 border-b-2 border-bh">
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
            }}
            className=" bg-white text-black dark:bg-gray-900 dark:text-white sunshine"
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
          <Button
            className="!bg-bh !text-white dark:!bg-bh-dark !sunshine"
            onClick={handleSubmit}
          >
            Post
          </Button>
        </Box>
      </Box>
    );
};

export default CreatePost;
