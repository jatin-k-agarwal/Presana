import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import Sidebar from "../components/Sidebar";

export default function SearchUsers() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isDark } = useTheme();
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
        `https://presana-backend.onrender.com/api/auth/search?query=${encodeURIComponent(searchQuery)}`,
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
    <div className={`min-h-screen flex overflow-hidden transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
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
      <div className="flex-1" onClick={() => sidebarOpen && setSidebarOpen(false)}>
        {/* Header - Mobile Friendly */}
        <header className={`shadow px-3 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 transition-colors ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(true);
              }}
              className="text-xl sm:text-3xl p-1.5 sm:p-2 hover:text-indigo-600 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
              aria-label="Open menu"
            >
              ☰
            </button>

            <div className="flex-1 min-w-0">
              <h1 className={`text-base sm:text-2xl font-bold truncate ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Search Users</h1>
              <p className={`text-[10px] sm:text-sm hidden xs:block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Find by name or ID
              </p>
            </div>
          </div>
        </header>

        {/* Content Area - Mobile Optimized */}
        <main className="p-3 sm:p-4 md:p-6">
          {/* Search Bar - Mobile Friendly */}
          <div className={`rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 transition-colors ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, userId, or email..."
                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm sm:text-lg transition-colors ${
                  isDark ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500'
                }`}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-semibold text-base sm:text-lg transition disabled:bg-gray-400 min-h-[48px] sm:min-h-[auto]"
              >
                {loading ? "🔍 Searching..." : "🔍 Search"}
              </button>
            </form>
          </div>

          {/* Search Results - Mobile Optimized */}
          <div className={`rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 transition-colors ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
              Search Results ({searchResults.length})
            </h2>

            {searchResults.length === 0 ? (
              <div className={`text-center py-8 sm:py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <p className="text-5xl sm:text-6xl mb-3 sm:mb-4">🔍</p>
                <p className="text-base sm:text-lg">No results yet</p>
                <p className="text-xs sm:text-sm mt-2">Search for users by name, userId, or email</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((resultUser) => (
                  <div
                    key={resultUser._id}
                    className={`p-4 sm:p-5 rounded-xl border-2 transition min-h-[80px] sm:min-h-[auto] ${
                      isDark ? 'border-gray-700 hover:border-indigo-600 hover:bg-gray-700/50' : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0">
                          {resultUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-base sm:text-lg truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                            {resultUser.name}
                          </p>
                          <p className={`text-xs sm:text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {resultUser.userId || `ID: ${resultUser._id.substring(0, 8)}...`}
                          </p>
                          <p className={`text-xs mt-1 truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {resultUser.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendFile(resultUser)}
                        className="w-full sm:w-auto px-5 sm:px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-semibold transition min-h-[48px] sm:min-h-[auto] text-sm sm:text-base whitespace-nowrap"
                        aria-label={`Send file to ${resultUser.name}`}
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
