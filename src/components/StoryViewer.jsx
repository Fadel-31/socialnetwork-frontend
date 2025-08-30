import React, { useState, useEffect } from "react";
import moment from "moment";

const StoryViewer = ({ story, onClose, userInfo }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentStory = story?.stories?.[currentIndex];

  const [progress, setProgress] = useState(0);
  const [reply, setReply] = useState("");

  const isOwner = userInfo?.email === story?.user?.email;

  useEffect(() => {
    if (!currentStory) return;

    setProgress(0);

    // Mark as viewed
    const markViewed = async () => {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      if (!token) return;

      try {
        await fetch(
          `https://socialnetwork-backend-production-7e1a.up.railway.app/api/stories/${currentStory._id}/view`,
          { method: "POST", headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error(err);
      }
    };
    markViewed();

    const interval = setInterval(() => setProgress(prev => (prev + 1 >= 100 ? 100 : prev + 1)), 100);
    const timeout = setTimeout(() => {
      if (currentIndex < story.stories.length - 1) setCurrentIndex(prev => prev + 1);
      else onClose();
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [currentStory]);

  if (!currentStory) return null;

  const mediaUrl = `https://socialnetwork-backend-production-7e1a.up.railway.app${currentStory.mediaUrl}`;
  const mediaType = currentStory.mediaType;
  const profilePic = `https://socialnetwork-backend-production-7e1a.up.railway.app${story.user?.profilePic || "/default-profile.jpg"}`;
  const username = story.user?.name || "Unknown";
  const timestamp = moment(currentStory.createdAt).fromNow();

  const viewers = Array.isArray(currentStory.viewers) ? currentStory.viewers : [];
  const uniqueViewers = Array.from(new Map(viewers.map(v => [v._id, v])).values());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 w-full flex gap-1 px-4 pt-4 z-50">
        {story.stories.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-100" style={{ width: idx < currentIndex ? "100%" : idx === currentIndex ? `${progress}%` : "0%" }} />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-10 left-4 flex items-center gap-3 text-white z-50">
        <img src={profilePic} alt={username} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
        <div>
          <div className="font-semibold">{username}</div>
          <div className="text-xs text-gray-300">{timestamp}</div>
        </div>
      </div>

      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-6 text-white text-3xl font-bold z-50">&times;</button>

      {/* Media */}
      {mediaType === "image" ? (
        <img src={mediaUrl} alt="Story" className="max-h-[80vh] max-w-full rounded-lg shadow-lg z-40" />
      ) : mediaType === "video" ? (
        <video src={mediaUrl} controls autoPlay className="max-h-[80vh] max-w-full rounded-lg shadow-lg z-40" />
      ) : <p className="text-white z-40">Unsupported media type</p>}

      {/* Reply */}
      {!isOwner && (
        <form onSubmit={(e) => { e.preventDefault(); alert(`Reply: ${reply}`); setReply(""); }} className="absolute bottom-6 w-full px-6 max-w-md flex gap-2 z-50">
          <input type="text" placeholder="Send a reply..." value={reply} onChange={e => setReply(e.target.value)} className="flex-grow rounded-full px-4 py-2 text-black" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700">Send</button>
        </form>
      )}

      {/* Viewers */}
      {isOwner && uniqueViewers.length > 0 && (
        <div className="absolute bottom-6 left-4 max-w-xs max-h-48 overflow-y-auto bg-black bg-opacity-70 rounded-lg p-3 text-white z-50">
          <h3 className="font-semibold mb-2">Viewed by:</h3>
          <ul>
            {uniqueViewers.map((v, idx) => (
              <li key={v._id || idx} className="flex items-center gap-2 mb-1">
                <img src={`https://socialnetwork-backend-production-7e1a.up.railway.app${v.profilePic || "/default-profile.jpg"}`} alt={v.name} className="w-6 h-6 rounded-full object-cover border border-white" />
                <span>{v.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StoryViewer;
