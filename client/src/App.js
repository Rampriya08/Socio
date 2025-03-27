import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/auth/login.jsx";
import Register from "./components/auth/register.jsx";
import Home from "./components/home/HomePage.js";
import Chat from "./components/message/chat.jsx";
import { Toaster } from "react-hot-toast";
import ProfilePage from "./components/home/Profile.jsx";
import { createTheme, ThemeProvider } from "@mui/material";
import { useState, useMemo, useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Navbar from "./components/home/navigation.jsx";

function App() {
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

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
        },
      }),
    [darkMode]
  );

  return (
    <div className="overflow-hidden h-screen sunshine ">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster position="top-right" reverseOrder={false} />
        <Router>
          <div className="h-[10vh]">
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>
          <div className="h-[90vh]">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/home" element={<Home />} />
              <Route
                path="/home"
                element={<Home  />}
              />

              <Route path="/chat" element={<Chat />} />
              <Route
                path="/profile/:userId"
                element={
                  <ProfilePage  />
                }
              />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </div>
  );
}

export default App;
