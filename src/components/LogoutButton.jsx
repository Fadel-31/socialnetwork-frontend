import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token
    navigate("/login"); // Redirect to login page
  };

  return (
    <button
      onClick={handleLogout}
      className="btn btn-outline btn-error"
      style={{ cursor: "pointer" }}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
