import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ sent: 0, received: 0, total: 0, totalSize: 0 });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      fetchHistory();
      fetchStats();
    }
  }, [navigate]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/transfers/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch history:", error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/transfers/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
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
        currentPage="history"
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
            <h1 className="text-2xl font-bold text-gray-800">Transfer History</h1>
            <p className="text-sm text-gray-500">View all your past file transfers</p>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <p className="text-4xl font-bold text-indigo-600">{stats.sent}</p>
              <p className="text-sm text-gray-600 mt-2">Files Sent</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <p className="text-4xl font-bold text-green-600">{stats.received}</p>
              <p className="text-sm text-gray-600 mt-2">Files Received</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <p className="text-4xl font-bold text-purple-600">{stats.total}</p>
              <p className="text-sm text-gray-600 mt-2">Total Transfers</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <p className="text-4xl font-bold text-orange-600">
                {formatFileSize(stats.totalSize)}
              </p>
              <p className="text-sm text-gray-600 mt-2">Total Data</p>
            </div>
          </div>

          {/* History List */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Transfers</h2>
            
            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">⏳</div>
                <p>Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-6xl mb-4">📭</p>
                <p className="text-lg">No transfer history yet</p>
                <p className="text-sm mt-2">Start sending files to see them here!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((transfer) => {
                  const currentUser = JSON.parse(localStorage.getItem("user"));
                  const isSent = transfer.sender._id === currentUser._id;
                  const otherUser = isSent ? transfer.receiver : transfer.sender;

                  return (
                    <div
                      key={transfer._id}
                      className={`p-5 rounded-xl border-2 transition hover:shadow-md ${
                        isSent
                          ? "bg-indigo-50 border-indigo-200 hover:border-indigo-300"
                          : "bg-green-50 border-green-200 hover:border-green-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`text-3xl ${
                              isSent ? "text-indigo-600" : "text-green-600"
                            }`}
                          >
                            {isSent ? "📤" : "📥"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-lg">
                              {transfer.fileName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {isSent ? "Sent to" : "Received from"}: <span className="font-medium">{otherUser.name}</span> ({otherUser.userId || "User"})
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-700">
                            {formatFileSize(transfer.fileSize)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(transfer.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
