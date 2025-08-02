import React, { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

const CreateStory = ({ userInfo, onStoryCreated }) => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(""); // "image" or "video"
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const fileInputRef = useRef(null);

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

    if (!file) {
      toast.error("Please upload an image or video for your story.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("media", file);
    formData.append("isStory", "true"); // important flag
    // Optionally add other fields like description if you want

    const token = sessionStorage.getItem("token") || localStorage.getItem("token");

    try {
      const res = await fetch("https://socialnetwork-backend-production-7e1a.up.railway.app/api/stories/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create story");
      }

      setFile(null);
      setFileType("");
      setShowPopup(false);
      toast.success("Story posted!");
      onStoryCreated();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="p-3 bg-white rounded shadow-sm mb-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={isSubmitting}
        >
          Add Story
        </button>
        <input
          type="file"
          accept="image/*,video/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isSubmitting}
        />
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded p-4 max-w-md w-[90%]">
            <h2 className="text-lg font-semibold mb-2">Create Story</h2>

            {previewUrl && fileType === "image" && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto rounded-md object-contain mb-3"
              />
            )}

            {previewUrl && fileType === "video" && (
              <video controls className="w-full h-auto rounded-md object-contain mb-3">
                <source src={previewUrl} type={file.type} />
                Your browser does not support the video tag.
              </video>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                  setShowPopup(false);
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post Story"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateStory;
