
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/auth/login.jsx';
import Register from './components/auth/register.jsx';
import Home from './components/home/HomePage.js';
import Chat from './components/message/chat.jsx';
import { Toaster } from "react-hot-toast";
import ProfilePage from './components/home/Profile.jsx';
import { createTheme, ThemeProvider } from "@mui/material";
import { useState, useMemo } from "react";
import CssBaseline from "@mui/material/CssBaseline";

function App() {
  const [darkMode, setDarkMode] = useState(false);

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
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster position="top-right" reverseOrder={false} />
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </>
  );
}

export default App;
