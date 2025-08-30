import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FriendProfile = () => {
  const { friendId } = useParams();
  const [friend, setFriend] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState({});
  const [isFriend, setIsFriend] = useState(false);
  const [visibleComments, setVisibleComments] = useState(null);

  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriendData = async () => {
      try {
        const resUser = await fetch(`https://socialnetwork-backend-production-7e1a.up.railway.app/api/user/${friendId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await resUser.json();
        if (!resUser.ok) throw new Error(userData.message || "Failed to load user");
        setFriend(userData);

        const resFriends = await fetch(`https://socialnetwork-backend-production-7e1a.up.railway.app/api/friends/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const friendsList = await resFriends.json();
        if (resFriends.ok) {
          setIsFriend(friendsList.some((f) => f._id === friendId));
        }

        const resPosts = await fetch(`https://socialnetwork-backend-production-7e1a.up.railway.app/api/posts/user/${friendId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const postData = await resPosts.json();
        if (!resPosts.ok) throw new Error(postData.message || "Failed to load posts");
        setPosts(postData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchFriendData();
  }, [friendId, token]);

  const handleLike = async (postId) => {
    await fetch(`https://socialnetwork-backend-production-7e1a.up.railway.app/api/posts/${postId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const res = await fetch(`https://socialnetwork-backend-production-7e1a.up.railway.app/api/posts/user/${friendId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const updatedPosts = await res.json();
    setPosts(updatedPosts);
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    await fetch(`https://socialnetwork-backend-production-7e1a.up.railway.app/api/posts/${postId}/comment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: commentText[postId] }),
    });

    setCommentText((prev) => ({ ...prev, [postId]: "" }));

    const res = await fetch(`https://socialnetwork-backend-production-7e1a.up.railway.app/api/posts/user/${friendId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const updatedPosts = await res.json();
    setPosts(updatedPosts);
  };

  if (error) return <div className="text-red-500">{error}</div>;
  if (!friend) return <div>Loading friend profile...</div>;

  const profilePicUrl =
    friend.profilePic?.trim()
      ? friend.profilePic.startsWith("http")
        ? friend.profilePic
        : `https://socialnetwork-backend-production-7e1a.up.railway.app/${friend.profilePic.startsWith("/") ? "" : "/"}${friend.profilePic}`
      : "/default-profile.jpg";

  const coverPicUrl =
    friend.coverPic?.trim()
      ? friend.coverPic.startsWith("http")
        ? friend.coverPic
        : `https://socialnetwork-backend-production-7e1a.up.railway.app/${friend.coverPic.startsWith("/") ? "" : "/"}${friend.coverPic}`
      : "/default-cover.jpg";

  // Animation variants for popup sliding from bottom
  const popupVariants = {
    hidden: { y: "100%" },
    visible: { y: 0 },
    exit: { y: "100%" },
  };

  return (
    <div className="w-full mt-6 bg-white text-black rounded shadow relative">
      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 text-gray-600 hover:text-purple-800 text-2xl px-4"
        aria-label="Back to Home"
      >
        ←
      </button>

      {/* Cover photo */}
      <div className="relative w-full">
        <img
          src={coverPicUrl}
          alt="Cover"
          className="w-full h-48 object-cover rounded"
          onError={(e) => {
            if (e.target.src !== "/default-cover.jpg") {
              e.target.src = "/default-cover.jpg";
            }
          }}
        />

        {/* Profile picture overlapping the cover */}
        <img
  src={profilePicUrl}
  alt="Profile"
  className="absolute left-1/2 transform -translate-x-1/2 -bottom-10 w-24 h-24 rounded-full border-4 border-white object-cover"
  onError={(e) => {
    e.target.src = "/default-profile.jpg";
  }}
/>

      </div>

      {/* Bio and friend status */}
      <div className="text-center mt-14 px-4">
        <h2 className="text-2xl font-bold">{friend.name}</h2>
        <p className="text-gray-700 text-sm mt-1">{friend.bio || "No bio available"}</p>

        <div className="flex justify-center items-center gap-3 mt-3">
          <span
            className={`px-3 py-1 rounded-full text-sm ${isFriend ? "bg-green-600 text-white" : "bg-red-600 text-white"
              }`}
          >
            {isFriend ? "Friends" : "Not Friends"}
          </span>
          <button
            onClick={() => navigate(`/chat/${friendId}`)}
            className="flex items-center gap-1 text-gray-600 hover:text-pink-600 transition"
          >
            <MessageCircle size={18} /> Message
          </button>
        </div>
      </div>

      {/* Posts */}
      <h3 className="text-xl mt-6 mb-2 px-4">Posts</h3>
      {posts.length === 0 ? (
        <p className="text-gray-500 italic px-4">No posts found.</p>
      ) : (
        posts.map((post) => (
          <div
            key={post._id}
            className="border border-gray-300 p-3 rounded mb-4 bg-gray-50 relative z-0 w-full"
          >
            {/* User info: profile pic + username side by side */}
            <div className="flex items-center gap-3 mb-2 px-4">
              <img
                src={profilePicUrl}
                alt={`${friend.name} profile`}
                className="w-12 h-12 rounded-full object-cover"
              />
              <span className="font-semibold text-gray-900">
                {friend.name}
                <p className="text-xs text-gray-500">
                  Posted on {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </span>
            </div>
            {/* Post caption */}
            <p className="px-4">{post.description}</p>
            {/* Post image */}
            {post.imageUrl && (
              <img
                src={`https://socialnetwork-backend-production-7e1a.up.railway.app/${post.imageUrl}`}
                alt="post"
                className="mb-2 rounded-md w-full"
              />
            )}



            {/* Like and comment buttons */}
            <div className="flex justify-between mt-2 px-4">
              <button
                onClick={() => handleLike(post._id)}
                className="text-sm text-purple-600 hover:text-pink-600"
              >
                {post.likes?.length || 0} Likes ❤️
              </button>

              <button
                onClick={() =>
                  setVisibleComments(visibleComments === post._id ? null : post._id)
                }
                className="text-sm text-gray-600 hover:text-gray-800"
                aria-label="Toggle comments"
              >
                💬 Comments ({post.comments?.length || 0})
              </button>
            </div>

            {/* Comments popup */}
            <AnimatePresence>
              {visibleComments === post._id && (
                <motion.div
                  key="comments-popup"
                  className="fixed left-0 right-0 bottom-0 bg-white rounded-t-xl shadow-lg border border-gray-300 max-h-[60vh] overflow-auto p-4 z-50"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={popupVariants}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 300 }}
                  dragElastic={0.3}
                  onDragEnd={(event, info) => {
                    if (info.point.y > window.innerHeight - 100) {
                      setVisibleComments(null);
                    }
                  }}
                >
                  <h4 className="text-lg font-semibold mb-3">Comments</h4>
                  {post.comments?.length === 0 ? (
                    <p className="text-gray-500 italic mb-2">No comments yet.</p>
                  ) : (
                    post.comments.map((c, idx) => (
                      <p key={idx} className="text-sm text-gray-700 mb-1">
                        <strong>{c.user?.name}:</strong> {c.text}
                      </p>
                    ))
                  )}
                  <form
                    onSubmit={(e) => handleCommentSubmit(e, post._id)}
                    className="mt-2 flex gap-2"
                  >
                    <input
                      type="text"
                      className="flex-1 px-2 py-1 rounded border border-gray-300 bg-white text-black"
                      placeholder="Write a comment..."
                      value={commentText[post._id] || ""}
                      onChange={(e) =>
                        setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))
                      }
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-pink-600 rounded text-white hover:bg-pink-700"
                    >
                      Send
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))
      )}
    </div>
  );
};

export default FriendProfile;
