import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Trash2, Send, ArrowLeft } from "lucide-react";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

const socket = io("https://socialnetwork-backend-production-7e1a.up.railway.app/");
const baseURL = "https://socialnetwork-backend-production-7e1a.up.railway.app";

const getProfilePicUrl = (pic) => {
  if (!pic?.trim()) return "/default-profile.png"; // fallback image path
  if (pic.startsWith("http")) return pic;
  return `${baseURL}${pic.startsWith("/") ? "" : "/"}${pic}`;
};

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  // Unread messages count per friend
  const [unreadMap, setUnreadMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("unreadMap")) || {};
    } catch {
      return {};
    }
  });

  // Last chat times per friend
  const [lastChatTimes, setLastChatTimes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lastChatTimes")) || {};
    } catch {
      return {};
    }
  });

  const [notifications, setNotifications] = useState([]);

  // Responsive states
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 450);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user"));

  const messagesEndRef = useRef();

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 450);
      if (window.innerWidth >= 450) setIsChatOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("unreadMap", JSON.stringify(unreadMap));
  }, [unreadMap]);

  useEffect(() => {
    localStorage.setItem("lastChatTimes", JSON.stringify(lastChatTimes));
  }, [lastChatTimes]);

  const updateLastChatTime = (friendId, msgs) => {
    if (!msgs.length) {
      setLastChatTimes((prev) => {
        const updated = { ...prev, [friendId]: null };
        return updated;
      });
      return;
    }
    const sorted = [...msgs].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    const lastMsg = sorted[sorted.length - 1];
    setLastChatTimes((prev) => ({
      ...prev,
      [friendId]: lastMsg.createdAt,
    }));
  };

  // Join socket room on connect
  useEffect(() => {
    socket.on("connect", () => {
      if (user?._id) {
        socket.emit("joinRoom", { userId: user._id });
      }
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [user]);

  // Load friends list
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await axios.get(`${baseURL}/api/friends/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(res.data);
      } catch (err) {
        console.error("Failed to load friends", err);
      }
    })();
  }, [token]);

  // Set selectedFriend based on URL userId param
  useEffect(() => {
    if (friends.length > 0 && userId) {
      const friend = friends.find((f) => f._id === userId);
      if (friend) {
        setSelectedFriend(friend);
        setUnreadMap((prev) => ({ ...prev, [friend._id]: 0 }));
        setIsChatOpen(true);
      }
    }
  }, [friends, userId]);

  // Load messages when friend selected
  useEffect(() => {
    if (!selectedFriend || !token) return;

    (async () => {
      try {
        const res = await axios.get(
          `${baseURL}/api/messages/${selectedFriend._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(res.data);
        updateLastChatTime(selectedFriend._id, res.data);
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    })();

    socket.emit("joinRoom", { userId: selectedFriend._id });

    // Clear unread count for selected friend
    setUnreadMap((prev) => ({
      ...prev,
      [selectedFriend._id]: 0,
    }));
  }, [selectedFriend, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle new incoming messages
  useEffect(() => {
    if (!user || friends.length === 0) return;

    const handleNewMessage = (msg) => {
      const senderId = msg.sender?._id || msg.sender;
      const receiverId = msg.receiver;

      const isRelevant =
        selectedFriend &&
        (senderId === selectedFriend._id || receiverId === selectedFriend._id);

      if (isRelevant) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          const updated = [...prev, msg];
          updateLastChatTime(selectedFriend._id, updated);
          return updated;
        });
      } else {
        // Mark as unread
        setUnreadMap((prev) => {
          const updated = {
            ...prev,
            [senderId]: (prev[senderId] || 0) + 1,
          };
          return updated;
        });

        // Add notification if not from self
        const currentUserId = user._id || user.id;
        if (senderId !== currentUserId) {
          const friend = friends.find((f) => f._id === senderId);
          if (friend) {
            setNotifications((prev) => [
              ...prev,
              {
                id: msg._id,
                friend,
                text: msg.text,
              },
            ]);
            setTimeout(() => {
              setNotifications((prev) =>
                prev.filter((n) => n.id !== msg._id)
              );
            }, 5000);
          }
        }
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [selectedFriend, user, friends]);

  // Handle deleted messages
  useEffect(() => {
    const handleDelete = (deletedMsgId) => {
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg._id !== deletedMsgId);
        if (selectedFriend) {
          updateLastChatTime(selectedFriend._id, filtered);
        }
        return filtered;
      });
    };

    socket.on("messageDeleted", handleDelete);
    return () => socket.off("messageDeleted", handleDelete);
  }, [selectedFriend]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !token || !selectedFriend) return;

    try {
      await axios.post(
        `${baseURL}/api/messages`,
        { receiverId: selectedFriend._id, text: newMsg },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewMsg("");
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`${baseURL}/api/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg._id !== messageId);
        if (selectedFriend) {
          updateLastChatTime(selectedFriend._id, filtered);
        }
        return filtered;
      });
    } catch (err) {
      console.error("❌ Failed to delete message", err);
    }
  };

  const formatLastChatTime = (friendId) => {
    const time = lastChatTimes[friendId];
    if (!time) return "No chats yet";
    return moment(time).fromNow();
  };

  const getLastChatTime = () => {
    if (!messages.length) return "No chats yet";
    const lastMsg = messages[messages.length - 1];
    return moment(lastMsg.createdAt).fromNow();
  };

  const selectFriendAndClear = (friend) => {
    setSelectedFriend(friend);
    setUnreadMap((prev) => ({
      ...prev,
      [friend._id]: 0,
    }));
    setNotifications((prev) => prev.filter((n) => n.friend._id !== friend._id));
    if (isSmallScreen) setIsChatOpen(true);
    navigate(`/chat/${friend._id}`, { replace: true });
  };

  return (
    <div className="flex h-screen relative">
      {/* Friend List */}
      <motion.div
        className="w-1/4 border-r p-4 overflow-y-auto bg-white z-20"
        initial={false}
        animate={{
          x: isSmallScreen && isChatOpen ? "-100%" : "0",
          opacity: isSmallScreen && isChatOpen ? 0 : 1,
          pointerEvents: isSmallScreen && isChatOpen ? "none" : "auto",
          position: isSmallScreen ? "fixed" : "relative",
          top: 0,
          bottom: 0,
          left: 0,
          width: isSmallScreen ? "100%" : undefined,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => {
              setIsChatOpen(false);
              navigate("/dashboard"); // navigate back to dashboard
            }}
            className="p-2 hover:bg-gray-200 rounded"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold m-0">Friends</h2>
        </div>

        <ul>
          {friends.map((friend) => (
            <li
              key={friend._id}
              onClick={() => selectFriendAndClear(friend)}
              className={`cursor-pointer p-2 rounded hover:bg-gray-200 flex items-center gap-3 ${
                selectedFriend?._id === friend._id ? "bg-gray-300" : ""
              }`}
            >
              <img
                src={getProfilePicUrl(friend.profilePic)}
                alt={friend.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex flex-col flex-grow">
                <span className="font-medium flex items-center gap-2 relative">
                  {friend.name}
                  {unreadMap[friend._id] > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="inline-flex items-center justify-center absolute -top-1 -right-4 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full select-none"
                    >
                      {unreadMap[friend._id]}
                    </motion.span>
                  )}
                </span>
                <span className="text-xs text-gray-500">
                  {formatLastChatTime(friend._id)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Chat Area */}
      <motion.div
        className="flex-1 flex flex-col bg-white z-10"
        initial={false}
        animate={{
          x: isSmallScreen ? (isChatOpen ? "0" : "100%") : "0",
          position: isSmallScreen ? "fixed" : "relative",
          top: 0,
          bottom: 0,
          right: 0,
          width: isSmallScreen ? "100%" : undefined,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {selectedFriend ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-4">
              {isSmallScreen && (
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded"
                  aria-label="Back to friends list"
                >
                  <ArrowLeft size={24} />
                </button>
              )}
              <img
                src={getProfilePicUrl(selectedFriend.profilePic)}
                alt={selectedFriend.name}
                className={`rounded-full object-cover ${
                  isSmallScreen ? "w-8 h-8" : "w-12 h-12"
                }`}
              />
              <div className="flex flex-col">
                <span
                  className={`font-semibold ${
                    isSmallScreen ? "text-base" : "text-lg"
                  }`}
                >
                  {selectedFriend.name}
                </span>
                <span className="text-sm text-gray-500">{getLastChatTime()}</span>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-2">
              {messages.map((msg) => {
                const userId = user._id || user.id;
                const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
                const isFromMe = senderId === userId;

                return (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`relative px-4 py-2 rounded-lg shadow max-w-xs break-words ${
                        isFromMe
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-200 text-black rounded-bl-none"
                      }`}
                    >
                      <span className="block">{msg.text}</span>
                      <span className="text-xs text-gray-500 block mt-1">
                        {moment(msg.createdAt).format("h:mm A")}
                      </span>
                      {isFromMe && (
                        <button
                          onClick={() => deleteMessage(msg._id)}
                          className="absolute top-1 right-1 text-gray-300 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t flex gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-grow border px-3 py-2 rounded"
                placeholder="Type a message"
              />
              <button
                onClick={sendMessage}
                className="text-black px-4 py-2 rounded flex items-center justify-center"
              >
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-500">
            Select a friend to start chatting
          </div>
        )}
      </motion.div>

      {/* Notification Popups */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 max-w-xs z-50">
        <AnimatePresence>
          {notifications.map(({ id, friend, text }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              layout
              className="bg-blue-600 text-white p-3 rounded shadow cursor-pointer flex items-center gap-3"
              onClick={() => selectFriendAndClear(friend)}
            >
              <img
                src={getProfilePicUrl(friend.profilePic)}
                alt={friend.name}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex flex-col truncate max-w-[200px]">
                <span className="font-semibold truncate">{friend.name}</span>
                <span className="text-sm truncate">{text}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Chat;
