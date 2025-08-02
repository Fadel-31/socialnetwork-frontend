import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AddFriends = ({
  visibleUsers,
  sentRequests,
  loadingUserId,
  handleAddFriend,
  handleCancelRequest,
}) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const closePopup = () => setSelectedUser(null);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Add Friends</h2>
      {visibleUsers.length === 0 ? (
        <p className="text-gray-400">No users to add.</p>
      ) : (
        <ul className="space-y-3">
          {visibleUsers.map((user) => {
            const isRequested = sentRequests.some(
              (req) => req.userId === user._id
            );
            return (
              <motion.li
                key={user._id}
                className="flex justify-between items-center p-3 rounded border border-gray-300 bg-white cursor-pointer"
                onClick={() => setSelectedUser(user)}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* User info */}
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={
                      user.profilePic
                        ? `https://socialnetwork-backend-production-7e1a.up.railway.app/${user.profilePic}`
                        : "/default-profile.jpg"
                    }
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-black truncate text-sm sm:text-base break-words">
                      {user.name}
                    </span>
                    <span className="text-black text-xs sm:text-sm truncate break-words">
                      {user.email}
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <div
                  className="flex-shrink-0"
                  onClick={(e) => e.stopPropagation()} // prevent popup on button click
                >
                  {isRequested ? (
                    <button
                      onClick={() =>
                        handleCancelRequest(
                          sentRequests.find((r) => r.userId === user._id)
                            ?.requestId
                        )
                      }
                      className="btn btn-warning text-xs sm:text-sm"
                      disabled={loadingUserId === user._id}
                    >
                      {loadingUserId === user._id
                        ? "Cancelling..."
                        : "Cancel Request"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddFriend(user._id)}
                      className="btn btn-primary text-xs sm:text-sm"
                      disabled={loadingUserId === user._id}
                    >
                      {loadingUserId === user._id ? "Sending..." : "Add Friend"}
                    </button>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}

      {/* Popup card */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg w-80 relative text-center"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={closePopup}
                className="absolute top-2 right-3 text-gray-500 text-xl hover:text-black"
              >
                ✕
              </button>
              <img
                src={
                  selectedUser.profilePic
                    ? `https://socialnetwork-backend-production-7e1a.up.railway.app/${selectedUser.profilePic}`
                    : "/default-profile.jpg"
                }
                alt={selectedUser.name}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
              />
              <h3 className="text-lg font-semibold text-black">
                {selectedUser.name}
              </h3>
              <p className="text-sm text-gray-600">{selectedUser.email}</p>
              <p className="mt-4 text-sm text-gray-800">
                Add friend to see their posts
              </p>
              <div className="mt-4">
                <button
                  onClick={() => {
                    handleAddFriend(selectedUser._id);
                    closePopup();
                  }}
                  className="btn btn-primary px-4 py-2 text-sm"
                >
                  Add Friend
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddFriends;
