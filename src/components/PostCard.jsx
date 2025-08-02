import React from "react";
import { FaHeart, FaComment } from "react-icons/fa";
import { ThumbsUp as Like } from "lucide-react";
import { MessageCircle as Comment } from "lucide-react";

const PostCard = ({
  post,
  handleLike,
  openCommentsPostId,
  setOpenCommentsPostId,
  setImagePreviewUrl,
}) => {
  return (
    <div key={post._id} className="w-full max-w-full mb-4 border-b border-gray-200 pb-4">
      {/* Author info */}
      <div className="flex items-center gap-2 mb-1">
        <img
          src={`https://socialnetwork-backend-production-7e1a.up.railway.app${post.author?.profilePic}`}
          alt={post.author?.name}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div>
          <p className="font-bold text-black text-sm">{post.author?.name || "User"}</p>
          <p className="text-xs text-gray-600">{post.author?.bio}</p>
        </div>
      </div>

      {/* Post description */}
      <p className="text-sm text-black mb-1">{post.description}</p>

      {/* Media: Image or Video */}
      {post.imageUrl && (
        <img
          src={`https://socialnetwork-backend-production-7e1a.up.railway.app${post.imageUrl}`}
          alt="post"
          className="w-full mb-1 rounded cursor-pointer"
          onClick={() => setImagePreviewUrl(`https://socialnetwork-backend-production-7e1a.up.railway.app${post.imageUrl}`)}
        />
      )}
      {post.mediaType === "video" && post.mediaUrl && (
        <video
          controls
          className="w-full max-h-[400px] mb-1 rounded"
          src={`https://socialnetwork-backend-production-7e1a.up.railway.app${post.mediaUrl}`}
        >
          Your browser does not support the video tag.
        </video>
      )}

      {/* Likes and Comments count below the media */}
      <div className="flex justify-between text-gray-600 text-sm mt-1 mb-2">
        <div className="flex items-center gap-1">
          <FaHeart />
          <span>{post.likes?.length || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <FaComment />
          <span>{post.comments?.length || 0}</span>
        </div>
      </div>

      {/* Like and Comment buttons under counts */}
      <div className="flex gap-6 text-black text-sm action-buttons">
        <button
          onClick={() => handleLike(post._id)}
          className="hover:text-blue-600 flex items-center gap-1 like-btn"
          aria-label="Like post"
        >
          <Like className="icon" />
          <span className="label">Like</span>
        </button>
        <button
          className="hover:text-blue-600 flex items-center gap-1 comment-btn"
          aria-label="Comment"
          onClick={() => {
            if (openCommentsPostId === post._id) {
              setOpenCommentsPostId(null); // close if clicking again
            } else {
              setOpenCommentsPostId(post._id); // open comment panel
            }
          }}
        >
          <Comment className="icon" />
          <span className="label">Comment</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
