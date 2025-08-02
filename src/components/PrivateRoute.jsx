// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  // If token doesn't exist, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
