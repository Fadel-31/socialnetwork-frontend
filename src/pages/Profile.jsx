import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProfilePicUpload from "../components/ProfilePicUpload";

const ChevronIcon = ({ isOpen }) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    animate={{ rotate: isOpen ? 180 : 0 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className="text-black"
  >
    <polyline points="6 9 12 15 18 9" />
  </motion.svg>
);

const BackArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-black hover:text-gray-700 transition cursor-pointer"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const Profile = () => {
  const [user, setUser] = useState(null);
  const [showEditOptions, setShowEditOptions] = useState(false);

  const [editedName, setEditedName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const res = await fetch("https://socialnetwork-backend-production-7e1a.up.railway.app/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load profile");

        const data = await res.json();
        setUser(data);
        setEditedName(data.name);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleNameUpdate = async () => {
    setLoading(true);
    setError("");
    const token = sessionStorage.getItem("token");

    try {
      const res = await fetch("https://socialnetwork-backend-production-7e1a.up.railway.app/api/user/update-name", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editedName }),
      });

      if (!res.ok) throw new Error("Failed to update name");

      setUser((prev) => ({ ...prev, name: editedName }));
      alert("Name updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword.trim()) {
      setError("Password cannot be empty");
      return;
    }
    setLoading(true);
    setError("");
    const token = sessionStorage.getItem("token");

    try {
      const res = await fetch("https://socialnetwork-backend-production-7e1a.up.railway.app/api/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!res.ok) throw new Error("Failed to change password");

      setNewPassword("");
      alert("Password changed successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className="text-red-600 p-4 font-comfortaa">{error}</div>;
  if (!user) return <div className="p-4 text-black font-comfortaa">Loading profile...</div>;

  return (
    <>
    <div className="max-w-md mx-auto mt-6 bg-white text-black font-comfortaa rounded shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
          {/* Back arrow */}
          <button
            onClick={() => navigate("/dashboard")}
            aria-label="Back to dashboard"
            className="focus:outline-none"
          >
            <BackArrowIcon />
          </button>

          <Link
            to={`/profilePage/${user._id}`}
            className="flex items-center gap-3 hover:text-gray-700 transition"
          >
            <img
              src={
                user.profilePic
                  ? `https://socialnetwork-backend-production-7e1a.up.railway.app${user.profilePic}`
                  : "/default-profile-pic.png"
              }
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover border border-gray-400"
            />
            <h2 className="text-lg font-bold text-sm-on-xs">{user.name}</h2>

          </Link>
        </div>

        <button
          onClick={() => setShowEditOptions((prev) => !prev)}
          className="focus:outline-none"
        >
          <ChevronIcon isOpen={showEditOptions} />
        </button>
      </div>
      

      {/* Only show Edit Name + Change Password */}
      <AnimatePresence initial={false}>
        {showEditOptions && (
          <motion.div
            key="edit-options"
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: 500 }}
            exit={{ opacity: 0, maxHeight: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden space-y-6 px-6 pb-6"
          >
            {/* Edit Name */}
            <div>
              <label className="block mb-1 font-semibold">Edit Name</label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full p-2 rounded border border-gray-300"
                disabled={loading}
              />
              <button
                onClick={handleNameUpdate}
                disabled={loading}
                className="mt-2 px-4 py-2 border border-black text-black rounded hover:bg-gray-400 transition disabled:opacity-50"
              >
                Update Name
              </button>

            </div>

            {/* Change Password */}
            <div>
              <label className="block mb-1 font-semibold">Change Password</label>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 rounded border border-gray-300"
                disabled={loading}
              />
              <button
                onClick={handlePasswordChange}
                disabled={loading}
                className="mt-2 px-4 py-2 border border-black text-black rounded hover:bg-gray-400 transition disabled:opacity-50"
              >
                Change Password
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>

  {/* New Section: + New User */}
<div className="px-4 pb-4">
  <button className="text-blue-600 font-semibold hover:underline cursor-pointer">
    + New User
  </button>
</div>

    </>
  );
};


export default Profile;
