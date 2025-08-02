import React, { useState, useEffect } from "react";
import moment from "moment";
import { motion } from "framer-motion";

const StoryViewer = ({ story, onClose, userInfo }) => {
  const { user, stories } = story || {};
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentStory = stories?.[currentIndex];

  const [progress, setProgress] = useState(0);
  const [reply, setReply] = useState("");

  // Dynamically get owner email for the current story
  const currentStoryOwnerEmail = currentStory?.ownerEmail || user?.email;
  const isOwner = userInfo?.email === currentStoryOwnerEmail;

  useEffect(() => {
    if (!currentStory) return;

    setProgress(0);

    const markViewed = async () => {
      const token = localStorage.getItem("token");
      if (!token || !currentStory._id) return;

      try {
        await fetch(`https://socialnetwork-backend-production-7e1a.up.railway.app/api/stories/${currentStory._id}/view`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error("Failed to mark story viewed", err);
      }
    };
    markViewed();

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next >= 100) clearInterval(interval);
        return next;
      });
    }, 100);

    const timeout = setTimeout(() => {
      if (currentIndex < stories.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onClose();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [currentStory]);

  if (!currentStory) return null;

  const profilePic = `https://socialnetwork-backend-production-7e1a.up.railway.app${user?.profilePic || "/default-profile.jpg"}`;
  const username = user?.name || "Unknown";
  const timestamp = moment(currentStory.createdAt).fromNow();

  const mediaUrl = `https://socialnetwork-backend-production-7e1a.up.railway.app${currentStory.mediaUrl}`;
  const mediaType = currentStory.mediaType;

  const handleClick = (e) => {
    e.stopPropagation();
    const clickX = e.clientX;
    const width = window.innerWidth;
    if (clickX < width / 2) {
      if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    } else {
      if (currentIndex < stories.length - 1) setCurrentIndex(currentIndex + 1);
      else onClose();
    }
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    alert(`Reply sent: ${reply}`);
    setReply("");
  };

  const viewers = Array.isArray(currentStory.viewers) ? currentStory.viewers : [];

  const uniqueViewers = [];
  const seen = new Set();
  viewers.forEach((viewer) => {
    if (viewer._id && !seen.has(viewer._id)) {
      seen.add(viewer._id);
      uniqueViewers.push(viewer);
    }
  });

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4"
      onClick={handleClick}
    >
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 w-full flex gap-1 px-4 pt-4 z-50">
        {stories.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all duration-100 linear"
              style={{
                width:
                  index < currentIndex
                    ? "100%"
                    : index === currentIndex
                    ? `${progress}%`
                    : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div
        className="absolute top-10 left-4 flex items-center gap-3 text-white z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={profilePic}
          alt={username}
          className="w-10 h-10 rounded-full border-2 border-white object-cover"
        />
        <div>
          <div className="font-semibold">{username}</div>
          <div className="text-xs text-gray-300">{timestamp}</div>
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-6 text-white text-3xl font-bold z-50"
      >
        &times;
      </button>

      {/* Story Content */}
      {mediaType === "image" ? (
        <img
          src={mediaUrl}
          alt="Story"
          className="max-h-[80vh] max-w-full rounded-lg shadow-lg z-40 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleClick(e);
          }}
        />
      ) : mediaType === "video" ? (
        <video
          src={mediaUrl}
          controls
          autoPlay
          className="max-h-[80vh] max-w-full rounded-lg shadow-lg z-40 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleClick(e);
          }}
        />
      ) : (
        <p className="text-white z-40">Unsupported media type</p>
      )}

      {/* Reply input if not owner */}
      {!isOwner && (
        <form
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleReplySubmit}
          className="absolute bottom-6 w-full px-6 max-w-md flex gap-2 z-50"
        >
          <input
            type="text"
            placeholder="Send a reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="flex-grow rounded-full px-4 py-2 text-black"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      )}

      {/* Show viewers only if owner */}
      {isOwner && uniqueViewers.length > 0 && (
        <div
          className="absolute bottom-6 left-4 max-w-xs max-h-48 overflow-y-auto bg-black bg-opacity-70 rounded-lg p-3 text-white z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="font-semibold mb-2">Viewed by:</h3>
          <ul>
            {uniqueViewers.map((viewer, index) => (
              <li
                key={viewer._id || index}
                className="flex items-center gap-2 mb-1"
              >
                <img
                  src={`https://socialnetwork-backend-production-7e1a.up.railway.app${viewer.profilePic || "/default-profile.jpg"}`}
                  alt={viewer.name || "Viewer"}
                  className="w-6 h-6 rounded-full object-cover border border-white"
                />
                <span>{viewer.name || "Unknown"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StoryViewer;
