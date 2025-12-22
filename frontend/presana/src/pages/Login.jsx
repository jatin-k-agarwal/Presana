import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", form);
      
      // Save token and user data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
      
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8">
        
        {/* Logo + App Name */}
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-indigo-600">📤</div>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">Prēṣaṇa</h1>
          <p className="text-gray-500 text-sm mt-1">
            Fast • Secure • Real-Time File Transfer
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold
            hover:bg-indigo-700 transition duration-300"
          >
            Login
          </button>
        </form>

        {/* Extra Options */}
        <div className="flex justify-between text-sm text-gray-600 mt-4">
          <Link className="hover:text-indigo-600">Forgot Password?</Link>
          <Link to="/register" className="hover:text-indigo-600">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
