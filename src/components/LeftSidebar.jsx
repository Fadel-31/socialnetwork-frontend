import React, { useRef } from "react";
import { FaCamera } from "react-icons/fa";

const LeftSidebar = ({ userInfo, postsCount, uploadCoverImage }) => {
  const fileInputCoverRef = useRef(null);

  return (
    <div className="lg:w-[25%] bg-white rounded shadow p-4 hidden md:flex flex-col items-center">
      <div className="w-full relative mb-10 rounded overflow-visible pb-12">
        <img
          src={`https://socialnetwork-backend-production-7e1a.up.railway.app${userInfo.coverPic}`}
          className="w-full h-24 object-cover rounded"
          alt="Cover"
        />
        <button
          onClick={() => fileInputCoverRef.current?.click()}
          className="absolute bottom-2 right-2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full shadow-lg transition"
          title="Upload Cover Image"
          type="button"
        >
          <FaCamera className="w-5 h-5" />
        </button>
        <img
          src={`https://socialnetwork-backend-production-7e1a.up.railway.app${userInfo.profilePic}`}
          className="w-16 h-16 rounded-full border-2 border-white absolute left-1/2 -bottom-8 transform -translate-x-1/2 object-cover"
          alt="Profile"
        />
      </div>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputCoverRef}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            uploadCoverImage(e.target.files[0]);
          }
        }}
      />

      <div className="mt-8 text-center">
        <p className="font-bold text-lg text-black">{userInfo.name}</p>
        <p className="text-sm text-gray-600">{userInfo.email}</p>

        <div className="flex gap-4 mt-4 text-sm text-black justify-center">
          <span>
            <strong>{postsCount}</strong> Posts
          </span>
          <span>
            <strong>8</strong> Friends
          </span>
        </div>

        <button
          className="mt-4 w-full px-4 py-2 rounded-xl shadow font-bold text-white"
          style={{ backgroundColor: "rgb(37,99,235)" }}
          onClick={() => window.location.href = "/profile"}
        >
          My Profile
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;
