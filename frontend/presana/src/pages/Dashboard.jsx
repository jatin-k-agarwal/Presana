import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { useToast } from "../context/ToastContext";
import Sidebar from "../components/Sidebar";
import OnlineUsers from "../components/OnlineUsers";
import FileUpload from "../components/FileUpload";
import FileReceiver from "../components/FileReceiver";

const CHUNK_SIZE = 64 * 1024; // 64KB chunks

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
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
    if (!selectedUser || !selectedFile || !socket) {
      showToast("Please select a user and file first!", "error");
      return;
    }

    setIsSending(true);
    setProgress(0);

    try {
      // Send file metadata first
      socket.emit("file-meta", {
        to: selectedUser,
        meta: {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
        },
      });

      // Read and send file in chunks
      let offset = 0;

      while (offset < selectedFile.size) {
        const chunk = selectedFile.slice(offset, offset + CHUNK_SIZE);
        const buffer = await chunk.arrayBuffer();

        socket.emit("file-chunk", {
          to: selectedUser,
          chunk: buffer,
        });

        offset += CHUNK_SIZE;
        const progressPercent = Math.min(
          Math.round((offset / selectedFile.size) * 100),
          100
        );
        setProgress(progressPercent);

        // Small delay to prevent overwhelming the socket
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Notify transfer complete
      socket.emit("file-complete", { to: selectedUser });

      // Log transfer to database
      await logTransfer(selectedUser, selectedFile);

      showToast(`File "${selectedFile.name}" sent successfully!`, "success");
      setSelectedFile(null);
      setProgress(0);
    } catch (error) {
      console.error("File send error:", error);
      showToast("Failed to send file. Please try again.", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-hidden">
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
            <h1 className="text-2xl font-bold text-gray-800">Prēṣaṇa</h1>
            <p className="text-sm text-gray-500">
              Fast • Secure • Real-Time File Transfer
            </p>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                selectedFile={selectedFile}
                onFileSelect={setSelectedFile}
                selectedUser={selectedUser}
                onSend={handleSendFile}
                progress={progress}
                isSending={isSending}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
