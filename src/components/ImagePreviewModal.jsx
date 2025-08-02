import React from "react";
import { FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

const ImagePreviewModal = ({ imageUrl, setImageUrl }) => {
  if (!imageUrl) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-80 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setImageUrl(null)}
      />

      {/* Modal Container */}
      <motion.div
        className="fixed inset-0 flex flex-col justify-center items-center z-50 p-4"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.25 } }}
        exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button above the image */}
        <button
          className="mb-4 text-white bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full p-2 transition"
          onClick={() => setImageUrl(null)}
          aria-label="Close preview"
          type="button"
        >
          <FaTimes size={28} />
        </button>

        {/* Zoomed Image */}
        <img
          src={imageUrl}
          alt="Preview"
          className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg object-contain"
        />
      </motion.div>
    </>
  );
};

export default ImagePreviewModal;
