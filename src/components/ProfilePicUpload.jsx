import React, { useState } from "react";

const ProfilePicUpload = ({ onUpload, children }) => {
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const token = sessionStorage.getItem("token");

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const res = await fetch(
        "https://socialnetwork-backend-production-7e1a.up.railway.app/api/user/profile-pic",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      onUpload(data.profilePic); // Update parent
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div onClick={() => setShowModal(true)} className="cursor-pointer">
        {children || (
          <button className="mt-2 text-sm text-blue-400 underline">Edit</button>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm text-black relative">
            <h3 className="text-lg font-semibold mb-4">
              Upload New Profile Picture
            </h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-1 bg-blue-600 text-white rounded"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};


export default ProfilePicUpload;
