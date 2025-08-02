import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { Image as ImageIcon, Video as VideoIcon, BarChartBig as PollIcon } from "lucide-react";
import toast from "react-hot-toast";

const CreatePost = ({ userInfo, onPostCreated }) => {
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(""); // "image", "video", or ""
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setShowPopup(false);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowPopup(true);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type.startsWith("image/")) {
      setFileType("image");
    } else if (selectedFile.type.startsWith("video/")) {
      setFileType("video");
    } else {
      toast.error("Only image and video files are allowed.");
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim() && !file) {
      toast.error("Please enter a status or upload an image/video.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("description", description.trim());
    if (file) formData.append("image", file);

    const token = sessionStorage.getItem("token") || localStorage.getItem("token");

    try {
      const res = await fetch("https://socialnetwork-backend-production-7e1a.up.railway.app/api/posts/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create post");
      }

      setDescription("");
      setFile(null);
      setFileType("");
      setShowPopup(false);
      onPostCreated();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form className="bg-white p-3 mb-4 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={`https://socialnetwork-backend-production-7e1a.up.railway.app${userInfo?.profilePic || "/default-profile.png"}`}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border -ml-4"
          />
          <input
            type="text"
            placeholder="What's on your mind?"
            className=" -mr-4 bg-stone-200 flex-grow border rounded-3xl px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 text-black text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!!file || isSubmitting}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs">
          <div className="flex gap-4 text-black">
            <div
              className="flex items-center cursor-pointer hover:text-blue-600"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              <span>Image</span>
            </div>
            <div
              className="flex items-center cursor-pointer hover:text-blue-600"
              onClick={() => videoInputRef.current?.click()}
            >
              <VideoIcon className="w-4 h-4 mr-1" />
              <span>Video</span>
            </div>
            <div
              className="flex items-center cursor-pointer hover:text-blue-600"
              onClick={() => toast("Poll functionality coming soon!")}
            >
              <PollIcon className="w-4 h-4 mr-1" />
              <span>Poll</span>
            </div>
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isSubmitting}
        />
        <input
          type="file"
          accept="video/*"
          className="hidden"
          ref={videoInputRef}
          onChange={handleFileChange}
          disabled={isSubmitting}
        />
      </form>

      {/* Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-xl w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-2">Create Post</h2>

            <textarea
              placeholder="What's on your mind?"
              className="w-full border border-gray-300 rounded-md p-2 mb-3 text-sm"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {previewUrl && fileType === "image" && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto rounded-md object-contain mb-3"
              />
            )}

            {previewUrl && fileType === "video" && (
              <video controls className="w-full h-auto rounded-md object-contain mb-3">
                <source src={previewUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                  setShowPopup(false);
                }}
                className="px-4 py-2 text-sm bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePost;
