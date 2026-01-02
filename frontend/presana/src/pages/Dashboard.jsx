import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import Sidebar from "../components/Sidebar";
import OnlineUsers from "../components/OnlineUsers";
import FileUpload from "../components/FileUpload";
import FileReceiver from "../components/FileReceiver";
import HowToUse from "../components/HowToUse";
import Footer from "../components/Footer";

const CHUNK_SIZE = 512 * 1024; // 512KB chunks for faster transfer

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { theme, toggleTheme, isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const hasShownToast = useRef(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  // Auto-select user from search page
  useEffect(() => {
    if (location.state?.selectedUser && !hasShownToast.current) {
      const searchedUser = location.state.selectedUser;
      setSelectedUser(searchedUser._id);
      
      // Add searched user to online users list if not already there
      setOnlineUsers((prevUsers) => {
        const userExists = prevUsers.some((u) => u._id === searchedUser._id);
        if (!userExists) {
          return [searchedUser, ...prevUsers];
        }
        return prevUsers;
      });
      
      showToast(`Ready to send file to ${searchedUser.name}`, "success");
      hasShownToast.current = true;
      
      // Clear the state to avoid re-selecting on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.selectedUser]);

  // Socket.IO connection
  useEffect(() => {
    const newSocket = io("https://presana-backend.onrender.com");
    setSocket(newSocket);

    // Join with user ID
    newSocket.emit("join", user._id);

    // Listen for online users
    newSocket.on("online-users", (users) => {
      // Filter out current user (users are now objects with _id, name, userId, etc.)
      const otherUsers = users.filter((u) => u._id !== user._id);
      setOnlineUsers(otherUsers);
    });

    return () => newSocket.close();
  }, [user._id]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (socket) socket.close();
    navigate("/");
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const logTransfer = async (receiverId, file) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://presana-backend.onrender.com/api/transfers/log",
        {
          receiver: receiverId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          status: "completed",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Failed to log transfer:", error);
    }
  };

  const handleSendFile = async () => {
    if (!selectedUser || selectedFiles.length === 0 || !socket) {
      showToast("Please select a user and files first!", "error");
      return;
    }

    setIsSending(true);
    setProgress(0);

    try {
      const totalFiles = selectedFiles.length;
      let filesCompleted = 0;

      for (const file of selectedFiles) {
        // Send file metadata WITH SENDER INFORMATION first
        socket.emit("file-meta", {
          to: selectedUser,
          meta: {
            name: file.name,
            size: file.size,
            type: file.type,
            sender: {
              name: user.name,
              userId: user.userId,
              _id: user._id,
            },
          },
        });

        // Read and send file in chunks
        let offset = 0;

        while (offset < file.size) {
          const chunk = file.slice(offset, offset + CHUNK_SIZE);
          const buffer = await chunk.arrayBuffer();

          socket.emit("file-chunk", {
            to: selectedUser,
            chunk: buffer,
          });

          offset += CHUNK_SIZE;
          
          // Calculate overall progress across all files
          const fileProgress = offset / file.size;
          const overallProgress = ((filesCompleted + fileProgress) / totalFiles) * 100;
          setProgress(Math.min(Math.round(overallProgress), 100));

          // Minimal delay only for progress UI updates (removed 10ms delay for speed)
          if (offset < file.size) {
            await new Promise((resolve) => setTimeout(resolve, 1));
          }
        }

        // Notify transfer complete for this file
        socket.emit("file-complete", { to: selectedUser });

        // Log transfer to database
        await logTransfer(selectedUser, file);

        filesCompleted++;
        
        // Minimal delay between files (reduced from 100ms to 50ms)
        if (filesCompleted < totalFiles) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }

      showToast(`${totalFiles} file${totalFiles > 1 ? 's' : ''} sent successfully!`, "success");
      setSelectedFiles([]);
      setProgress(0);
    } catch (error) {
      console.error("File send error:", error);
      showToast("Failed to send files. Please try again.", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`min-h-screen flex overflow-hidden transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* File Receiver - Hidden component listening for incoming files */}
      <FileReceiver socket={socket} />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        logout={logout}
        onUserUpdate={handleUserUpdate}
        currentPage="dashboard"
      />

      {/* Main Content */}
      <div className="flex-1" onClick={() => sidebarOpen && setSidebarOpen(false)}>
        {/* Header - Mobile Friendly Single Row */}
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
              <h1 className={`text-base sm:text-2xl font-bold truncate ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Prēṣaṇa</h1>
              <p className={`text-[10px] sm:text-sm hidden xs:block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Fast • Secure
              </p>
            </div>
          </div>

          {/* Action Buttons - Compact for Mobile */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Theme Toggle Button - Mobile Optimized */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
              className={`p-2 sm:p-2 rounded-lg sm:rounded-xl transition-all min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="text-xl sm:text-2xl">{isDark ? '☀️' : '🌙'}</span>
            </button>

            {/* Guide Toggle Button - Mobile Optimized */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowGuide(!showGuide);
              }}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2 rounded-lg sm:rounded-xl font-semibold transition-all min-w-[40px] min-h-[40px] sm:min-h-[44px] ${
                showGuide
                  ? "bg-indigo-600 text-white"
                  : isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              aria-label={showGuide ? "Hide Guide" : "How to Use"}
            >
              <span className="text-xl sm:text-lg">{showGuide ? "📖" : "❓"}</span>
              <span className="hidden sm:inline text-sm sm:text-base">
                {showGuide ? "Hide Guide" : "How to Use"}
              </span>
            </button>
          </div>
        </header>

        {/* Content Area - Mobile Optimized */}
        <main className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left: Online Users */}
            <div className="lg:col-span-1">
              <OnlineUsers
                users={onlineUsers}
                selectedUser={selectedUser}
                onSelectUser={setSelectedUser}
              />
            </div>

            {/* Right: File Upload */}
            <div className="lg:col-span-2">
              <FileUpload
                selectedFiles={selectedFiles}
                onFilesSelect={setSelectedFiles}
                selectedUser={selectedUser}
                onSend={handleSendFile}
                progress={progress}
                isSending={isSending}
              />
            </div>
          </div>

          {/* How to Use Guide Section - Below Main Content */}
          {showGuide && (
            <div className="animate-fadeIn">
              <HowToUse />
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
