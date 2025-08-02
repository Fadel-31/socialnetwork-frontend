import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const Register = () => {
  // Add username in formData state
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "https://socialnetwork-backend-production-7e1a.up.railway.app/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Registered successfully! You can now log in.");
        setFormData({ name: "", username: "", email: "", password: "" }); // Clear form
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setMessage(data.message || "❌ Registration failed");
      }
    } catch (err) {
      setMessage("⚠️ Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F2C] px-2 sm:px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="card bg-white/10 backdrop-blur-md shadow-xl p-4 sm:p-6 rounded-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-white">
            Register
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <motion.input
              whileFocus={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="w-full bg-white/80 text-black p-2 sm:p-3 rounded-xl outline-none text-sm sm:text-base focus:ring-2 focus:ring-indigo-400"
            />
            {/* New username input */}
            <motion.input
              whileFocus={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
              className="w-full bg-white/80 text-black p-2 sm:p-3 rounded-xl outline-none text-sm sm:text-base focus:ring-2 focus:ring-indigo-400"
            />
            <motion.input
              whileFocus={{ scale: 1.03 }}
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
              whileFocus={{ scale: 1.03 }}
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
              Register
            </motion.button>
          </form>

          {message && (
            <p className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-green-400">
              {message}
            </p>
          )}

          <p className="text-center mt-4 sm:mt-6 text-xs sm:text-sm text-gray-300">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-400 font-semibold hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
