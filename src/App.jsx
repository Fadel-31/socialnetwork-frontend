import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Friends from "./pages/Friends"; // <-- you need to create this!
import FriendRequests from "./pages/FriendRequests";
import FriendProfile from "./pages/FriendProfile";
import Home from './pages/Home';
import { Toaster } from 'react-hot-toast';
import ProfilePage from "./pages/ProfilePage";
import Navbar from './components/Navbar';
import Chat from "./pages/Chat"; // 👈 import Chat page





const App = () => {
  return (
    <>
      {/* Your existing code */}
      <Toaster position="top-center" />

      <Router>
        <div className="min-h-screen bg-base-200 p-4">
          <Routes>
            <Route path="/" element={<Navigate to="/register" />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />

            {/* Protected Route */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route path="/friends" element={<Friends />} />
            <Route path="/friend-requests" element={<FriendRequests />} />
            <Route path="/friend/:friendId" element={<FriendProfile />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profilePage/:id" element={<ProfilePage />} />
            <Route path="/chat/:userId" element={<Chat />} />
            <Route path="/chat" element={<Chat />} /> {/* 👈 Define this route */}

          </Routes>
        </div>
      </Router>
    </>
  );
};

export default App;
