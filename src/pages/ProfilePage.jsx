import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const AddCommentInput = ({ postId, onAddComment }) => {
  const [commentText, setCommentText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(postId, commentText.trim());
    setCommentText("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
      <input
        type="text"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Write a comment..."
        className="flex-grow p-2 rounded bg-white text-gray-700 border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
      >
        Post
      </button>
    </form>
  );
};

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [commentsPost, setCommentsPost] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showCoverOptions, setShowCoverOptions] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showFullCoverImage, setShowFullCoverImage] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");

  const fileInputProfileRef = useRef(null);
  const fileInputCoverRef = useRef(null);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchUserAndPosts = async () => {
      try {
        const userRes = await fetch(`https://socialnetwork-backend-production-7e1a.up.railway.app/api/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) throw new Error("Failed to fetch user");

        const userData = await userRes.json();
        setUser(userData);

        const postRes = await fetch(`https://socialnetwork-backend-production-7e1a.up.railway.app/api/posts/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!postRes.ok) throw new Error("Failed to fetch posts");

        const postData = await postRes.json();
        setPosts(postData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserAndPosts();
  }, [id, token]);

  // Profile pic upload
  const handleChangeProfilePhotoClick = () => {
  fileInputProfileRef.current?.click(); // trigger the file picker first
  setShowImageOptions(false);           // then close the modal
};


  const handleProfileFileChange = async (e) => {
    if (!e.target.files.length) return;

    const formData = new FormData();
    formData.append("profilePic", e.target.files[0]);

    try {
      const res = await fetch(`https://socialnetwork-backend-production-7e1a.up.railway.app/api/user/profile-pic`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setUser((prev) => ({ ...prev, profilePic: data.profilePic }));
    } catch (err) {
      alert(err.message);
    }
  };

  // Cover pic upload
  const handleChangeCoverPhotoClick = () => {
    setShowCoverOptions(false);
    fileInputCoverRef.current?.click();
  };

  const handleCoverFileChange = async (e) => {
    if (!e.target.files.length) return;

    const formData = new FormData();
    formData.append("coverPic", e.target.files[0]);

    try {
      const res = await fetch("https://socialnetwork-backend-production-7e1a.up.railway.app/api/user/cover-pic", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setUser((prev) => ({ ...prev, coverPic: data.coverPic }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddComment = async (postId, commentText) => {
    try {
      const res = await fetch(`https://socialnetwork-backend-production-7e1a.up.railway.app/api/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: commentText }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      const updatedPost = await res.json();
      setPosts((prev) => prev.map((p) => (p._id === postId ? updatedPost : p)));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;
    try {
      const res = await fetch(`https://socialnetwork-backend-production-7e1a.up.railway.app/api/posts/${selectedPost._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete post");

      // Update post list
      setPosts((prev) => prev.filter((p) => p._id !== selectedPost._id));
      setShowPostOptions(false);
      setSelectedPost(null);
    } catch (err) {
      alert(err.message);
    }
  };



  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!user) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="font-comfortaa px-0 py-6 min-h-screen bg-white text-gray-800">


      {/* Back Arrow */}
      {/* Back Arrow + Search Icon */}
      <div className="flex items-center justify-between mb-4 w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/profile/${user._id}`)}
          className="flex items-center text-black hover:text-black transition"
          aria-label="Back to Edit Profile"
        >
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>

        </button>

        {/* Search Icon */}
        <button
          className="text-black hover:text-black transition"
          aria-label="Search"
          onClick={() => alert("Search coming soon")} // Replace this with your actual search logic
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>


      {/* Cover + Profile Picture Section */}
      <div className="relative w-full max-w-md mx-auto mb-28 border border-indigo-200 rounded-xl shadow-lg overflow-visible">
        {/* Cover Image */}
        {/* Cover Image */}
        <div className="relative rounded-t-xl overflow-hidden">
          <img
            src={`https://socialnetwork-backend-production-7e1a.up.railway.app${user.coverPic || "/default-cover.jpg"}`}
            alt="Cover"
            className="w-full h-48 object-cover rounded-t-xl cursor-pointer"
            onClick={() => setShowCoverOptions(true)} // optional: click image to open options
          />

          <div className="absolute bottom-2 right-2 flex space-x-2">

            {/* Button: Change Cover Photo Options */}
            {/* Button: Cover Photo Options Icon */}
            <button
              onClick={() => setShowCoverOptions(true)}
              aria-label="Cover photo options"
              className="bg-gray-400 text-white p-2 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l3-3h12l3 3M4 8v10a2 2 0 002 2h12a2 2 0 002-2V8M12 11a3 3 0 100 6 3 3 0 000-6z"
                />
              </svg>
            </button>

          </div>
        </div>


        {/* Profile Picture */}
        <div
          className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 cursor-pointer"
          onClick={() => setShowImageOptions(true)}
        >
          <img
            src={`https://socialnetwork-backend-production-7e1a.up.railway.app${user.profilePic}`}
            alt={user.name}
            className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-lg"
          />
          {/* Edit icon */}
          <div className="absolute bottom-0 right-0 bg-gray-400 rounded-full p-1 shadow-md">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 7h4l3-3h6l3 3h4v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Username below */}
      <div className="text-center -mt-14 mb-8">
        <h2 className="text-3xl font-bold text-black">{user.name}</h2>
      </div>


      <div className="flex flex-nowrap gap-2 mb-4 justify-center overflow-x-hidden">
        <button className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-indigo-600 transition text-xs sm:text-sm flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add to Story
        </button>

        <button
          onClick={() => {
            setEditName(user.name);
            setEditBio(user.bio || "");
            setShowEditProfile(true);
          }}
          className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition text-xs sm:text-sm flex-shrink-0"
        >
          {/* svg icon */}
          Edit Profile
        </button>

      </div>

      {/* Bio Section */}
      <div className="mb-4 w-full">
        <h3 className="text-xl font-semibold text-black mb-1">Details</h3>
        <p className="text-gray-700">{user.bio || "No bio provided."}</p>
      </div>


      {/* Posts Section */}
      <div className="p-1 md:p-4">
        <h3 className="text-xl font-semibold text-black mb-4 ">Posts</h3>
        {posts.length === 0 ? (
          <p className="text-gray-500 italic">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="mb-6 p-4 border border-indigo-200 rounded-lg relative fullwidth-below-350"
            >


              {/* 3 Dots Top Right */}
              <button
                onClick={() => {
                  setSelectedPost(post);
                  setShowPostOptions(true);
                }}
                className="absolute top-2 right-2 text-xl font-bold text-gray-500 hover:text-black z-10"
                aria-label="Post options"
              >
                ⋯
              </button>
              {/* User Info Header */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={`https://socialnetwork-backend-production-7e1a.up.railway.app${user.profilePic}`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-indigo-300"
                />
                <div>
                  <p className="font-semibold text-black">{user.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <p className="font-medium text-black mb-2 description-padding-below-350">{post.description}</p>
              {post.imageUrl && (
                <img
                  src={`https://socialnetwork-backend-production-7e1a.up.railway.app${post.imageUrl}`}
                  alt="Post"
                  className="rounded mb-2 w-[90%] max-h-[400px] object-cover border border-indigo-300 image-fullwidth-below-350"
                  style={{ maxWidth: "100vw" }}
                />
              )}
              <div className="flex justify-between items-start text-sm text-black relative">
                <div>
                  ❤️ {post.likes?.length || 0} Likes
                  <button onClick={() => setCommentsPost(post)} className="ml-4 hover:underline">
                    💬 {post.comments?.length || 0} Comments
                  </button>
                </div>

              </div>

            </div>
          ))
        )}
      </div>

      {/* Comments Modal */}
      <AnimatePresence>
        {commentsPost && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-end z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommentsPost(null)}
          >
            <motion.div
              className="bg-white rounded-t-lg p-6 w-full max-w-md h-screen flex flex-col"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.3}
              onDragEnd={(event, info) => {
                if (info.offset.y > 150) {
                  setCommentsPost(null);
                }
              }}
              style={{ touchAction: "pan-y" }}
            >
              <div className="w-12 h-1.5 bg-gray-400 rounded mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-black mb-4 text-center">
                Comments
              </h3>
              <div className="flex-grow overflow-y-auto mb-4">
                {commentsPost.comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="mb-3 border-b border-indigo-200 pb-2 flex items-center gap-3"
                  >
                    <img
                      src={`https://socialnetwork-backend-production-7e1a.up.railway.app${comment.user.profilePic}`}
                      alt={comment.user.name}
                      className="w-8 h-8 rounded-full border border-indigo-400"
                    />
                    <div>
                      <span className="font-semibold text-black">{comment.user.name}</span>
                      <span className="ml-2 text-gray-700">{comment.text}</span>
                    </div>
                  </div>
                ))}
              </div>
              <AddCommentInput
                postId={commentsPost._id}
                onAddComment={handleAddComment}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file inputs */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputProfileRef}
        onChange={handleProfileFileChange}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputCoverRef}
        onChange={handleCoverFileChange}
        className="hidden"
      />

      {/* Modal for profile image options */}
      <AnimatePresence>
        {showImageOptions && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-end z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageOptions(false)}
          >
            <motion.div
              className="bg-white rounded-t-lg p-6 w-full max-w-md text-center"
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-black mb-4">Profile Picture</h3>
              <button
                onClick={() => {
                  setShowFullImage(true);
                  setShowImageOptions(false);
                }}
                className="w-full mb-3 px-4 py-2 bg-indigo-500 rounded hover:bg-indigo-600 text-white"
              >
                View Full Photo
              </button>
              <button
                onClick={handleChangeProfilePhotoClick}
                className="w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800"
              >
                Change Photo
              </button>
              <button
                onClick={() => setShowImageOptions(false)}
                className="mt-4 text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image View */}
      {showFullImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50"
          onClick={() => setShowFullImage(false)}
        >
          <img
            src={`https://socialnetwork-backend-production-7e1a.up.railway.app${user.profilePic}`}
            alt={user.name}
            className="max-w-full max-h-full rounded-lg"
          />
        </div>
      )}
      {showFullCoverImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50"
          onClick={() => setShowFullCoverImage(false)}
        >
          <img
            src={`https://socialnetwork-backend-production-7e1a.up.railway.app${user.coverPic || "/default-cover.jpg"}`}
            alt="Cover Full"
            className="max-w-full max-h-full rounded-lg"
          />
        </div>
      )}


      {/* Modal for cover image options */}
      <AnimatePresence>
        {showCoverOptions && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-end z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCoverOptions(false)}
          >
            <motion.div
              className="bg-white rounded-t-lg p-6 w-full max-w-md text-center"
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-black mb-4">Cover Photo</h3>
              <button
                onClick={() => {
                  setShowFullCoverImage(true);
                  setShowCoverOptions(false);
                }}
                className="w-full mb-3 px-4 py-2 bg-indigo-500 rounded hover:bg-indigo-600 text-white"
              >
                View Full Photo
              </button>
              <button
                onClick={handleChangeCoverPhotoClick}
                className="w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800"
              >
                Change Cover Photo
              </button>
              <button
                onClick={() => setShowCoverOptions(false)}
                className="mt-4 text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPostOptions && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-end z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowPostOptions(false);
              setSelectedPost(null);
            }}
          >
            <motion.div
              className="bg-white rounded-t-lg p-6 w-full max-w-md text-center"
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-black mb-4">Post Options</h3>

              <button
                onClick={handleDeletePost}
                className="w-full mb-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete Post
              </button>

              <button
                onClick={() => alert("Hide from profile feature coming soon")}
                className="w-full mb-3 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Hide from Profile
              </button>

              <button
                onClick={() => {
                  setShowPostOptions(false);
                  setSelectedPost(null);
                }}
                className="text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {showEditProfile && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditProfile(false)}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-md"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4 text-black">Edit Profile</h3>

              <label className="block mb-2 text-black font-medium">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />

              <label className="block mb-2 text-black font-medium">Bio</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={4}
                className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />

            

             
              {/* Save Button */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    // Save changes: update name and bio
                    try {
                      const res = await fetch(`https://socialnetwork-backend-production-7e1a.up.railway.app/api/user/${user._id}`, {
                        method: "PUT",
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ name: editName, bio: editBio }),
                      });
                      if (!res.ok) throw new Error("Failed to update profile");
                      const updatedUser = await res.json();
                      setUser(updatedUser);
                      setShowEditProfile(false);
                    } catch (err) {
                      alert(err.message);
                    }
                  }}
                  className="px-4 py-2 rounded bg-indigo-500 text-white hover:bg-indigo-600 transition"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>




    </div>
  );
};

export default ProfilePage;
