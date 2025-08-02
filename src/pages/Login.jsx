import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Lottie from "lottie-react";
import { motion } from "framer-motion";
import userAnimation from "../assets/Connect.json"; // <-- animation file

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://socialnetwork-backend-production-7e1a.up.railway.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Login successful! Redirecting...");
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setMessage(data.message || "❌ Login failed");
      }
    } catch (err) {
      setMessage("⚠️ Server error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0F2C] px-4">
      {/* App name */}
      <h2 className="text-white text-xl font-comfortaa mb-2">Connectea</h2>

      {/* Animated user icon */}
      <motion.div
        className="w-44 h-44 sm:w-40 sm:h-40 mb-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <Lottie animationData={userAnimation} loop={true} />
      </motion.div>

      {/* Card container */}
      <motion.div
        className="w-full max-w-md"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
      >
        <div className="card bg-white/10 backdrop-blur-md shadow-xl p-4 sm:p-6 rounded-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-white">
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <motion.input
              whileFocus={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full bg-white/80 text-black p-2 sm:p-3 rounded-xl outline-none text-sm sm:text-base focus:ring-2 focus:ring-indigo-400"
            />
            <motion.input
              whileFocus={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full bg-white/80 text-black p-2 sm:p-3 rounded-xl outline-none text-sm sm:text-base focus:ring-2 focus:ring-indigo-400"
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full mt-2 p-2 sm:p-3 bg-white text-black font-semibold hover:bg-gray-200 rounded-xl text-sm sm:text-base"
            >
              Login
            </motion.button>
          </form>

          {message && (
            <p
              className={`mt-3 sm:mt-4 text-center text-xs sm:text-sm ${
                message.includes("successful")
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}

          <p className="text-center mt-4 sm:mt-6 text-xs sm:text-sm text-gray-300">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-400 font-semibold hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
