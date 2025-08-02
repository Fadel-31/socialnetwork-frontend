import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { MessageCircle as Comment } from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import CreatePost from "../components/CreatePost";
import MediaModal from "../components/MediaModal";
import ImagePreviewModal from "../components/ImagePreviewModal";
import PostCard from "../components/PostCard";
import CommentPopup from "../components/CommentPopup";
import StoryViewer from "../components/StoryViewer";

const socket = io("https://socialnetwork-backend-production-7e1a.up.railway.app/"); // Change to your backend URL if different

const Dashboard = () => {
  const navigate = useNavigate();

  // States
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [userInfo, setUserInfo] = useState({
    _id: null,
    name: "",
    email: "",
    profilePic: "/default-profile.jpg",
    coverPic: "/default-cover.jpg",
  });
  const [activeNav, setActiveNav] = useState("home");
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);

  // New: State for new message notification
  const [hasNewMessage, setHasNewMessage] = useState(false);

  // Use sessionStorage instead of localStorage for token & user
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");

  // Ref for hidden file input for story upload
  const storyFileInputRef = useRef(null);

  // Fetch stories function
  const fetchStories = async () => {
    if (!token) return;
    try {
      const res = await fetch("https://socialnetwork-backend-production-7e1a.up.railway.app/api/stories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStories(data);
    } catch (err) {
      console.error("Failed to fetch stories");
    }
  };

  // Fetch user info from backend
  const fetchUserInfo = async () => {
    if (!token) return;
    try {
      const res = await fetch("https://socialnetwork-backend-production-7e1a.up.railway.app/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUserInfo({
        _id: data._id,
        name: data.name,
        email: data.email,
        profilePic: data.profilePic || "/default-profile.jpg",
        coverPic: data.coverPic || "/default-cover.jpg",
      });
    } catch (err) {
      console.error("Failed to fetch user info");
    }
  };

  // Fetch posts for feed
  const fetchPosts = () => {
    if (!token) return navigate("/login");
    fetch("https://socialnetwork-backend-production-7e1a.up.railway.app/api/posts/feed", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        toast.success("Posts refreshed! 🎉");
      });
  };

  // Cover image upload function
  const uploadCoverImage = async (file) => {
    if (!token) return toast.error("You must be logged in");

    const formData = new FormData();
    formData.append("coverPic", file);

    try {
      const res = await fetch("https://socialnetwork-backend-production-7e1a.up.railway.app/api/user/cover-pic", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to upload cover image");
        return;
      }

      toast.success("Cover image updated!");
      fetchUserInfo();
    } catch (err) {
      console.error(err);
      toast.error("Error uploading cover image");
    }
  };

  // Handle actual story upload file select event
  const handleStoryFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!token) return toast.error("You must be logged in");

    const formData = new FormData();
    formData.append("storyMedia", file);

    try {
      const res = await fetch("https://socialnetwork-backend-production-7e1a.up.railway.app/api/stories/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Story added successfully!");
        fetchStories();
      } else {
        toast.error(data.message || "Failed to add story");
      }
    } catch (err) {
      toast.error("Error uploading story");
    } finally {
      e.target.value = null;
    }
  };

  // Like post handler
  const handleLike = async (postId) => {
    try {
      const res = await fetch(`https://socialnetwork-backend-production-7e1a.up.railway.app/api/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        toast.error(errData.message || "Failed to like post");
        return;
      }
      fetchPosts();
    } catch (error) {
      toast.error("Network error while liking post");
    }
  };

  // Submit new post handler
  const handlePostSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!token) return navigate("/login");

    if (!description.trim() && !selectedImage && !selectedVideo) {
      toast.error("Please add text or media to post");
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    if (selectedImage) formData.append("image", selectedImage);
    if (selectedVideo) formData.append("video", selectedVideo);

    try {
      const res = await fetch("https://socialnetwork-backend-production-7e1a.up.railway.app/api/posts/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to create post");
        return;
      }

      toast.success("Post created successfully!");
      setDescription("");
      setSelectedImage(null);
      setSelectedVideo(null);
      setShowMediaModal(false);
      fetchPosts();
    } catch (err) {
      toast.error("Error creating post");
    }
  };

  // Navigation click handler
  const handleNavClick = (navName) => {
    setActiveNav(navName);

    if (navName === "home") {
      fetchPosts();
    } else if (navName === "friends") {
      navigate("/friends");
    } else if (navName === "comments") {
      toast("Messages/comments coming soon!");
      setHasNewMessage(false); // Clear notification when opening messages
    }
  };

  // After post created, refresh posts
  const handlePostCreated = () => {
    fetchPosts();
  };

  // After story created, refresh stories
  const handleStoryCreated = () => {
    fetchStories();
  };

  // Group stories by userId
  const groupedStories = stories.reduce((acc, story) => {
    const userId = story.userId?._id;
    if (!userId) return acc;
    if (!acc[userId]) {
      acc[userId] = {
        user: story.userId,
        stories: [],
      };
    }
    acc[userId].stories.push(story);
    return acc;
  }, {});

  // SOCKET.IO: Setup connection and listen for new messages
  useEffect(() => {
    if (!token || !userInfo._id) return;

    // Join a room for the current user (optional - based on backend)
    socket.emit("join", { userId: userInfo._id });

    // Listen for new message events
    socket.on("newMessage", (message) => {
      // Could add more filtering here if needed (e.g., check recipient)
      setHasNewMessage(true);
      toast.success("New message received!");
    });

    return () => {
      socket.off("newMessage");
    };
  }, [token, userInfo._id]);

  // On mount fetch data
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchUserInfo();
    fetchPosts();
    fetchStories();
  }, [token]);

  return (
    <div className="min-h-screen bg-white font-comfortaa">
      <Navbar
        userInfo={userInfo}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        navigate={navigate}
        onNavClick={handleNavClick}
        hasNewMessage={hasNewMessage}  // Pass notification flag
        clearMessageNotification={() => setHasNewMessage(false)} // Pass clear func
      />

      <div className="flex flex-col lg:flex-row gap-6 py-6 w-full">
        <LeftSidebar
          userInfo={userInfo}
          navigate={navigate}
          postsCount={posts.length}
          uploadCoverImage={uploadCoverImage}
        />

        <CreatePost userInfo={userInfo} onPostCreated={handlePostCreated} />

        <div className="w-full lg:w-[50%]">
          {/* Profile pic + plus icon to add a story */}
          <div
            onClick={() => storyFileInputRef.current?.click()}
            className="relative w-20 h-20 cursor-pointer"
            title="Add a new story"
          >
            <img
              src={`https://socialnetwork-backend-production-7e1a.up.railway.app${userInfo.profilePic || "/default-profile.jpg"}`}
              alt="Your profile"
              className="w-full h-full rounded-full object-cover border-2 border-blue-500"
            />
            <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
              <span className="text-white text-xl leading-none font-bold select-none">+</span>
            </div>
          </div>

          <input
            ref={storyFileInputRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: "none" }}
            onChange={handleStoryFileChange}
          />

          <div className="bg-white rounded-md shadow-sm border px-4 py-4 my-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 px-1">Stories</h2>

            <div className="flex flex-wrap gap-4 pb-2 max-h-[300px] overflow-y-auto">
              {Object.values(groupedStories).length === 0 ? (
                <p className="text-gray-500 text-sm">No stories available</p>
              ) : (
                Object.values(groupedStories).map((group) => (
                  <div
                    key={group.user._id}
                    className="flex flex-col items-center cursor-pointer min-w-[70px] z-10"
                    title={group.user.name || "User"}
                    onClick={() => setSelectedStory(group)}
                  >
                    <img
                      src={`https://socialnetwork-backend-production-7e1a.up.railway.app${group.user.profilePic || "/default-profile.jpg"}`}
                      alt={group.user.name || "User"}
                      className="w-16 h-16 rounded-full border-2 border-blue-500 object-cover"
                    />
                    <span className="text-xs mt-1 text-center truncate w-full">
                      {group.user.name || "User"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedStory && (
            <StoryViewer story={selectedStory} onClose={() => setSelectedStory(null)} />
          )}

          {showMediaModal && (
            <MediaModal
              selectedImage={selectedImage}
              selectedVideo={selectedVideo}
              description={description}
              setDescription={setDescription}
              setSelectedImage={setSelectedImage}
              setSelectedVideo={setSelectedVideo}
              setShowMediaModal={setShowMediaModal}
              handlePostSubmit={handlePostSubmit}
            />
          )}

          {imagePreviewUrl && (
            <ImagePreviewModal
              imagePreviewUrl={imagePreviewUrl}
              setImagePreviewUrl={setImagePreviewUrl}
            />
          )}

          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              fetchPosts={fetchPosts}
              setImagePreviewUrl={setImagePreviewUrl}
              setOpenCommentsPostId={setOpenCommentsPostId}
              handleLike={handleLike}
            />
          ))}

          {openCommentsPostId && (
            <CommentPopup
              posts={posts}
              openCommentsPostId={openCommentsPostId}
              setOpenCommentsPostId={setOpenCommentsPostId}
              DRAG_CLOSE_THRESHOLD={100}
              fetchPosts={fetchPosts}
            />
          )}
        </div>

        <div className="hidden lg:block lg:w-[25%]"></div>
      </div>
    </div>
  );
};

export default Dashboard;
