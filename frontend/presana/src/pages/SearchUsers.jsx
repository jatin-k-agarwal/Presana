import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext";
import Sidebar from "../components/Sidebar";

export default function SearchUsers() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      showToast("Please enter a search term", "error");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/auth/search?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSearchResults(response.data);
      
      if (response.data.length === 0) {
        showToast("No users found", "info");
      }
    } catch (error) {
      console.error("Search error:", error);
      showToast("Search failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendFile = (selectedUser) => {
    // Navigate to dashboard with selected user info
    navigate("/dashboard", {
      state: {
        selectedUser: {
          _id: selectedUser._id,
          name: selectedUser.name,
          userId: selectedUser.userId,
        },
      },
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        logout={logout}
        onUserUpdate={handleUserUpdate}
        currentPage="search"
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-2xl hover:text-indigo-600"
          >
            ☰
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-800">Search Users</h1>
            <p className="text-sm text-gray-500">Find users by name or ID</p>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          {/* Search Bar */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, userId, or email..."
                className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg transition disabled:bg-gray-400"
              >
                {loading ? "🔍 Searching..." : "🔍 Search"}
              </button>
            </form>
          </div>

          {/* Search Results */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Search Results ({searchResults.length})
            </h2>

            {searchResults.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-6xl mb-4">🔍</p>
                <p className="text-lg">No results yet</p>
                <p className="text-sm mt-2">Search for users by name, userId, or email</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((resultUser) => (
                  <div
                    key={resultUser._id}
                    className="p-5 rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                          {resultUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-lg text-gray-800">
                            {resultUser.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {resultUser.userId || `ID: ${resultUser._id.substring(0, 8)}...`}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {resultUser.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendFile(resultUser)}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition"
                      >
                        📤 Send File
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
