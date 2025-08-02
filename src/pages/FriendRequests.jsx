import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";



const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    fetch("https://socialnetwork-backend-production-7e1a.up.railway.app/api/friends/requests", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setRequests)
      .catch(() => setError("Failed to load friend requests"));
  }, []);

  const handleAccept = async (requestId) => {
  const token = sessionStorage.getItem("token");
  setLoadingIds((ids) => [...ids, requestId]);
  try {
    const res = await fetch(`https://socialnetwork-backend-production-7e1a.up.railway.app/api/friends/accept/${requestId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Accept response status:", res.status);

    if (res.ok) {
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } else {
      const data = await res.json();
      console.log("Accept error data:", data);
      alert(data.message || "Failed to accept request");
    }
  } catch (error) {
    console.error("Accept fetch error:", error);
    alert("Network error while accepting request");
  } finally {
    setLoadingIds((ids) => ids.filter((id) => id !== requestId));
  }
};


  const handleReject = async (requestId) => {
    const token = sessionStorage.getItem("token");
    const res = await fetch(`https://socialnetwork-backend-production-7e1a.up.railway.app/api/friends/reject/${requestId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="mt-6 max-w-xl mx-auto bg-gray-900 p-6 rounded text-white">
      <Link
        to="/dashboard"
        className="inline-block mb-4 text-blue-400 hover:text-blue-600 transition duration-150"
      >
        ← Back to Dashboard
      </Link>
      <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
      {requests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        requests.map((req) => (
          <div key={req._id} className="flex justify-between mb-3">
            <div>
              <p>{req.from.name}</p>
              <p className="text-sm text-gray-400">{req.from.email}</p>
            </div>
            <div className="space-x-2">
              <button onClick={() => handleAccept(req._id)} className="btn btn-success">Accept</button>
              <button onClick={() => handleReject(req._id)} className="btn btn-error">Reject</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FriendRequests;
