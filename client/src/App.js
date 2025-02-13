
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/auth/login.jsx';
import Register from './components/auth/register.jsx';
import Home from './components/home/HomePage.js';
import Chat from './components/message/chat.jsx';


import ChatInterface from './Avatar/AvatarCreator.jsx';
import ProfilePage from './components/home/Profile.jsx';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
    
        <Route path="/avatar" element={<ChatInterface />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />

      </Routes>
    </Router>
  );
}

export default App;
