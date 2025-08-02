import React, { useState } from "react";
import { motion } from "framer-motion";

const CommentsPopup = ({
  posts,
  openCommentsPostId,
  setOpenCommentsPostId,
  DRAG_CLOSE_THRESHOLD,
  fetchPosts,
}) => {
  const post = posts.find((p) => p._id === openCommentsPostId);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      setSubmitting(true);
      const res = await fetch(`https://socialnetwork-backend-production-7e1a.up.railway.app/api/posts/${openCommentsPostId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (!res.ok) throw new Error("Failed to add comment");

      setNewComment("");
      fetchPosts(); // Refresh posts after comment
    } catch (err) {
      console.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-40 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        onClick={() => setOpenCommentsPostId(null)}
      />

      {/* Draggable Comments Popup */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 300 }}
        dragElastic={0.3}
        onDragEnd={(event, info) => {
          if (info.point.y - info.offset.y > DRAG_CLOSE_THRESHOLD) {
            setOpenCommentsPostId(null);
          }
        }}
        initial={{ y: "100%", opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          transition: { type: "spring", stiffness: 300, damping: 30 },
        }}
        exit={{
          y: "100%",
          opacity: 0,
          transition: { duration: 0.2 },
        }}
        className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-white shadow-lg rounded-t-xl overflow-y-auto z-50 flex flex-col justify-between"
        style={{ touchAction: "pan-y", height: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 overflow-y-auto flex-grow">
          {!post ? (
            <p className="text-center text-gray-500">Post not found</p>
          ) : !post.comments || post.comments.length === 0 ? (
            <p className="text-gray-600 text-center text-sm">No comments yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {post.comments.map((comment) => (
                <div
                  key={comment._id}
                  className="flex items-center gap-2 border-b border-gray-200 pb-1"
                >
                  <img
                    src={`https://socialnetwork-backend-production-7e1a.up.railway.app${comment.user?.profilePic || "/default-profile.jpg"}`}
                    alt={comment.user?.name || "User"}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <p className="text-xs text-gray-800">
                    <strong>{comment.user?.name || "User"}:</strong> {comment.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Input Section */}
        <form
          onSubmit={handleAddComment}
          className="border-t border-gray-300 p-3 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-grow border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={submitting}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm"
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </form>
      </motion.div>
    </>
  );
};

export default CommentsPopup;
