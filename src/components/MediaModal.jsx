import React from "react";
import { FaTimes, FaEdit, FaPaperPlane } from "react-icons/fa";
import { motion } from "framer-motion";

const MediaModal = ({
  show,
  setShow,
  description,
  setDescription,
  selectedImage,
  selectedVideo,
  onPostSubmit,
  onClear,
}) => {
  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-70 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0 }}
        onClick={() => setShow(false)}
      />

      {/* Modal Card */}
      <motion.div
        className="fixed inset-0 flex justify-center items-center z-50 p-4"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.25 } }}
        exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg relative flex flex-col items-center"
          style={{ maxWidth: "90vw" }}
        >
          {/* Close Button */}
          <button
            className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 transition"
            onClick={() => setShow(false)}
            aria-label="Close"
            type="button"
          >
            <FaTimes size={22} />
          </button>

          {/* Description Input */}
          <textarea
            className="w-full border border-gray-300 rounded-md p-3 mb-6 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
            placeholder="Write a description..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Media Preview */}
          <div className="mb-4 w-full flex justify-center">
            {selectedImage && (
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Preview"
                className="max-h-96 rounded-lg shadow-md object-contain"
                style={{ maxHeight: "60vh" }}
              />
            )}
            {selectedVideo && (
              <video
                controls
                className="max-h-96 rounded-lg shadow-md object-contain"
                src={URL.createObjectURL(selectedVideo)}
                style={{ maxHeight: "60vh" }}
              />
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-5 w-full justify-end flex-wrap sm:flex-nowrap">
            <button
              type="button"
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-lg font-semibold transition-shadow shadow-sm sm:px-5 sm:py-3 sm:text-base text-sm"
              onClick={onClear}
            >
              <FaEdit className="sm:text-base text-sm" /> Edit
            </button>

            <button
              type="button"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold shadow-lg transition-shadow sm:px-5 sm:py-3 sm:text-base text-sm"
              onClick={onPostSubmit}
            >
              <FaPaperPlane className="sm:text-base text-sm" /> Post
            </button>
          </div>
        </div>

        {/* Extra style for very small screens */}
        <style>{`
          @media (max-width: 350px) {
            .max-w-lg {
              max-width: 90vw !important;
            }
          }
        `}</style>
      </motion.div>
    </>
  );
};

export default MediaModal;
