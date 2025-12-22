import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import EditProfileModal from "./EditProfileModal";

export default function Sidebar({ isOpen, onClose, user, logout, onUserUpdate, currentPage }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { showToast } = useToast();

  const navItems = [
    { name: "Home", path: "/dashboard", icon: "🏠" },
    { name: "Search Users", path: "/search", icon: "🔍" },
    { name: "Transfer History", path: "/history", icon: "📜" },
  ];

  const copyUserId = () => {
    const userIdText = user.userId || user._id;
    navigator.clipboard.writeText(userIdText).then(() => {
      showToast("User ID copied to clipboard!", "success");
    }).catch(() => {
      showToast("Failed to copy", "error");
    });
  };

  return (
    <>
      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onUpdate={onUserUpdate}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900 text-white
        transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-300 z-50`}
      >
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-xl hover:text-red-400"
          >
            ✖
          </button>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center text-center px-6">
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <h2 className="mt-3 font-semibold text-lg">
            {user.name || 'User'}
          </h2>

          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-400">
              ID: {user.userId || user._id?.substring(0, 8) + "..."}
            </p>
            <button
              onClick={copyUserId}
              className="text-indigo-400 hover:text-indigo-300 transition"
              title="Copy User ID"
            >
              📋
            </button>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="mt-4 text-sm text-indigo-400 hover:underline"
          >
            Edit Profile
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="px-6 mt-8 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition
                ${
                  currentPage === item.path.split('/')[1]
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 w-full px-6">
          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 transition
            text-white py-2 rounded-xl font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
