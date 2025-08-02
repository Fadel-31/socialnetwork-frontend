import React, { useState } from "react";
import {
  FaHome,
  FaUserFriends,
  FaBars,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, LogOut } from "lucide-react";
import toast from "react-hot-toast";

const Navbar = ({
  activeNav,
  onNavClick,
  userInfo,
  hasNewMessage = false,              // NEW: notification flag
  clearMessageNotification = () => {}, // NEW: callback to clear notif
}) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged out successfully!");
    navigate("/login");
  };

  // NEW: Handle message icon click
  const handleMessagesClick = () => {
    clearMessageNotification(); // clear badge when user clicks messages
    navigate("/chat");
  };

  return (
    <nav className="bg-white text-black py-3 sticky top-0 z-50 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mx-0 w-full">

        {/* Left side container with title on left and search on right */}
        <div className="flex items-center justify-between w-full sm:w-auto mb-3 sm:mb-0 px-0">

          {/* Title */}
          <h1
            className="text-xl font-bold cursor-pointer select-none"
            onClick={() => navigate("/")}
          >
            Connectea
          </h1>

          {/* Search */}
          <div className="relative flex items-center">
            <FaSearch
              className={`cursor-pointer text-black text-xl transition-opacity duration-200 ${
                showSearch ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              onClick={() => setShowSearch(true)}
              aria-label="Open search"
            />

            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 100 }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden flex items-center border border-gray-300 rounded"
                >
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="px-2 py-1 outline-none w-full text-black"
                  />
                  <FaTimes
                    className="cursor-pointer text-black mx-2"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery("");
                    }}
                    aria-label="Close search"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right side */}
        <div className="flex gap-6 text-xl items-center px-0">
          <FaHome
            className={`cursor-pointer ${activeNav === "home" ? "text-blue-600" : "text-black"}`}
            onClick={() => onNavClick("home")}
          />

          {/* MESSAGE ICON WITH NOTIFICATION DOT */}
          <div
            className="relative cursor-pointer"
            onClick={handleMessagesClick}
            title="Messages"
          >
            <MessageCircle className="text-black" size={20} />
            {hasNewMessage && (
              <span
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full ring-2 ring-white"
                aria-label="New message notification"
              />
            )}
          </div>

          <FaUserFriends
            className={`cursor-pointer ${activeNav === "friends" ? "text-blue-600" : "text-black"}`}
            onClick={() => onNavClick("friends")}
          />

          {/* Hamburger Menu (mobile) */}
          <div className="relative sm:hidden">
            <FaBars
              className="cursor-pointer text-black"
              onClick={() => setShowDropdown((prev) => !prev)}
            />
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  key="dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 bg-white border shadow rounded-md px-3 py-2 z-50 text-sm w-40 flex flex-col gap-3"
                >
                  {/* Profile */}
                  <div
                    className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
                    onClick={() => {
                      navigate("/profile");
                      setShowDropdown(false);
                    }}
                  >
                    <img
                      src={`https://socialnetwork-backend-production-7e1a.up.railway.app/${userInfo.profilePic}`}
                      className="w-5 h-5 rounded-full object-cover border"
                      alt="Profile"
                    />
                    <span className="text-xs font-medium truncate">{userInfo.name}</span>
                  </div>

                  {/* Logout */}
                  <div
                    className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span className="text-xs font-medium">Logout</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile (desktop) */}
          <div className="hidden sm:flex items-center gap-2 ml-4">
            <img
              src={`https://socialnetwork-backend-production-7e1a.up.railway.app/${userInfo.profilePic}`}
              className="w-8 h-8 rounded-full object-cover border cursor-pointer"
              alt="Profile"
              onClick={() => navigate("/profile")}
            />
            <span className="font-medium text-black">{userInfo.name}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
