import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserFriends, FaUserPlus } from "react-icons/fa";
import { MessageCircle, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddFriends from "../components/AddFriends";

const Friends = () => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    profilePic: "/default-profile.jpg",
    coverPic: "/default-cover.jpg",
  });
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("friends"); // 'friends' or 'requests'
  const [openMenuId, setOpenMenuId] = useState(null);

  const menuRef = useRef(null);
  const navigate = useNavigate();

  const token = sessionStorage.getItem("token");
  const baseUrl = "https://socialnetwork-backend-production-7e1a.up.railway.app";

  // Fetch logged-in user info with full profilePic URL
  const fetchUserInfo = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${baseUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUserInfo({
        name: data.name,
        email: data.email,
        profilePic: data.profilePic ? `${baseUrl}${data.profilePic}` : `${baseUrl}/default-profile.jpg`,
        coverPic: data.coverPic ? `${baseUrl}${data.coverPic}` : `${baseUrl}/default-cover.jpg`,
      });
    } catch (err) {
      console.error("Failed to fetch user info");
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchUserInfo();

    // Fetch all users
    fetch(`${baseUrl}/api/user/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setUsers)
      .catch(() => setError("Failed to load users"));

    // Fetch accepted friends
    fetch(`${baseUrl}/api/friends/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setFriends)
      .catch(() => setError("Failed to load friends"));

    // Fetch sent friend requests
    fetch(`${baseUrl}/api/friends/sent`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((req) => ({
          userId: req.to._id,
          requestId: req._id,
        }));
        setSentRequests(formatted);
      })
      .catch(() => setError("Failed to load sent requests"));

    // Fetch received friend requests with full profilePic URLs
    fetch(`${baseUrl}/api/friends/requests`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((req) => ({
          userId: req.from._id,
          requestId: req._id,
          name: req.from.name,
          email: req.from.email,
          profilePic: req.from.profilePic ? `${baseUrl}${req.from.profilePic}` : `${baseUrl}/default-profile.jpg`,
        }));
        setReceivedRequests(formatted);
      })
      .catch(() => setError("Failed to load received requests"));
  }, [token]);

  // Close menu if click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddFriend = async (userId) => {
    try {
      setLoadingUserId(userId);

      const res = await fetch(`${baseUrl}/api/friends/add/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        // Refresh sent requests after adding
        const sentRes = await fetch(`${baseUrl}/api/friends/sent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sentData = await sentRes.json();
        const formatted = sentData.map((req) => ({
          userId: req.to._id,
          requestId: req._id,
        }));
        setSentRequests(formatted);
      } else {
        alert(data.message || "Failed to send request");
      }
    } catch {
      alert("Server error");
    } finally {
      setLoadingUserId(null);
    }
  };
  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await fetch(`${baseUrl}/api/friends/accept/${requestId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        // Remove request from the UI
        setReceivedRequests((prev) => prev.filter((r) => r.requestId !== requestId));

        // Refresh friends list
        const friendsRes = await fetch(`${baseUrl}/api/friends/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const friendsData = await friendsRes.json();
        setFriends(friendsData);
      } else {
        alert(data.message || "Failed to accept request");
      }
    } catch (err) {
      alert("Server error while accepting request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const res = await fetch(`${baseUrl}/api/friends/reject/${requestId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setReceivedRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      } else {
        alert(data.message || "Failed to reject request");
      }
    } catch (err) {
      alert("Server error while rejecting request");
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm("Are you sure you want to remove this friend?")) return;

    try {
      const res = await fetch(`${baseUrl}/api/friends/remove/${friendId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setFriends((prev) => prev.filter((friend) => friend._id !== friendId));
      } else {
        alert(data.message || "Failed to remove friend");
      }
    } catch {
      alert("Server error while removing friend.");
    }
  };

  // Helpers
  const isFriend = (userId) => friends.some((f) => f._id === userId);
  const currentUser = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const currentUserId = currentUser ? currentUser.id : null;
  const visibleUsers = users.filter(
    (user) => user._id !== currentUserId && !isFriend(user._id)
  );

  // Navigate to chat page for the friend
  const goToChat = (userId) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 px-2">
      <Link
        to="/dashboard"
        className="inline-block mb-4 text-blue-400 hover:text-blue-600 transition duration-150"
      >
        ←
      </Link>

      {/* Tabs */}
      <div className="flex justify-center gap-3 sm:gap-6 mb-6 flex-nowrap">
        <button
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-full font-semibold text-xs sm:text-base ${activeTab === "requests"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700"
            }`}
          onClick={() => setActiveTab("requests")}
        >
          <FaUserPlus size={16} className="sm:w-5 sm:h-5" />
          Requests
          {receivedRequests.length > 0 && (
            <span className="ml-1 bg-red-600 text-white rounded-full px-1 sm:px-2 text-[10px] sm:text-xs">
              {receivedRequests.length}
            </span>
          )}
        </button>

        <button
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-full font-semibold text-xs sm:text-base ${activeTab === "friends"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700"
            }`}
          onClick={() => setActiveTab("friends")}
        >
          <FaUserFriends size={16} className="sm:w-5 sm:h-5" />
          Friends
          <span className="ml-1 bg-gray-300 text-gray-800 rounded-full px-1 sm:px-2 text-[10px] sm:text-xs">
            {friends.length}
          </span>
        </button>
      </div>

      {/* Content with motion */}
      <AnimatePresence mode="wait">
        {activeTab === "requests" && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
            {receivedRequests.length === 0 ? (
              <p className="text-gray-400">No incoming friend requests.</p>
            ) : (
              receivedRequests.map((req) => (
                <div
                  key={req.requestId}
                  className="flex justify-between items-center mb-3 bg-gray-900 p-3 rounded text-white"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.profilePic}
                      alt={req.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p>{req.name}</p>
                      <p className="text-sm text-gray-400">{req.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(req.requestId)}
                      className="btn btn-primary"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req.requestId)}
                      className="btn btn-warning"
                    >
                      Reject
                    </button>


                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === "friends" && (
          <motion.div
            key="friends"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-4">Your Friends</h2>
            {friends.length === 0 ? (
              <p className="text-gray-400">You have no friends yet.</p>
            ) : (
              <ul className="mb-6 space-y-3">
                {friends.map((friend) => (
                  <li
                    key={friend._id}
                    className="flex justify-between items-center p-3 rounded relative border border-gray-300"
                  >
                    {/* Left: Profile picture + username */}
                    <Link
                      to={`/friend/${friend._id}`}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <img
                        src={
                          friend.profilePic
                            ? `https://socialnetwork-backend-production-7e1a.up.railway.app${friend.profilePic}`
                            : "/default-profile.jpg"
                        }
                        alt={friend.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-semibold">{friend.name}</span>
                    </Link>

                    {/* Right: message + menu */}
                    <div className="flex items-center gap-4 relative">
                      <MessageCircle
                        className="cursor-pointer text-gray-600 hover:text-blue-500 transition-colors duration-200"
                        size={20}
                        onClick={() => goToChat(friend._id)}
                      />

                      <div ref={menuRef} className="relative">
                        <MoreVertical
                          className="cursor-pointer text-gray-600 hover:text-blue-500 transition-colors duration-200"
                          size={20}
                          onClick={() =>
                            setOpenMenuId(openMenuId === friend._id ? null : friend._id)
                          }
                        />
                        {openMenuId === friend._id && (
                          <div
                            className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg text-black z-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                handleRemoveFriend(friend._id);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-red-600 hover:text-white"
                            >
                              Remove Friend
                            </button>
                            <button
                              onClick={() => {
                                goToChat(friend._id);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white"
                            >
                              Message Friend
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <AddFriends
              visibleUsers={visibleUsers}
              sentRequests={sentRequests}
              loadingUserId={loadingUserId}
              handleAddFriend={handleAddFriend}
              handleCancelRequest={handleCancelRequest}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Friends;
