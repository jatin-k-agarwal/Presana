import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function OnlineUsers({ users, selectedUser, onSelectUser }) {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter users based on search query
  const filteredUsers = users.filter((userInfo) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const userName = (userInfo.name || '').toLowerCase();
    const userEmail = (userInfo.email || '').toLowerCase();
    const userId = (userInfo.userId || userInfo._id || '').toLowerCase();
    return userName.includes(query) || userEmail.includes(query) || userId.includes(query);
  });
  
  return (
    <div className={`rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 transition-colors ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
        <span className="text-xl sm:text-2xl">👥</span>
        <span className="text-base sm:text-xl">Online Users ({users.length})</span>
      </h2>

      {/* Search Input - Mobile Optimized */}
      <div className="mb-3 sm:mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className={`w-full px-4 py-3 sm:py-2.5 pl-10 rounded-xl border-2 transition-all text-sm sm:text-base ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-indigo-500 focus:bg-gray-600' 
                : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500 focus:border-indigo-500 focus:bg-white'
            }`}
            aria-label="Search online users"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition ${
                isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
              }`}
              aria-label="Clear search"
            >
              ✖
            </button>
          )}
        </div>
        {searchQuery && (
          <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {filteredUsers.length === 0 ? (
        <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <p className="text-4xl mb-2">{searchQuery ? '🔍' : '😔'}</p>
          <p>{searchQuery ? 'No users found' : 'No users online'}</p>
          <p className="text-sm mt-1">{searchQuery ? 'Try a different search' : 'Waiting for others to join...'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((userInfo) => {
            const userId = userInfo._id;
            const userName = userInfo.name || 'Unknown User';
            const displayId = userInfo.userId || `ID: ${userId.substring(0, 8)}...`;
            const userEmail = userInfo.email;
            
            return (
              <button
                key={userId}
                onClick={() => onSelectUser(userId)}
                className={`w-full p-4 rounded-xl text-left transition min-h-[72px] sm:min-h-[auto]
                  ${
                    selectedUser === userId
                      ? "bg-indigo-600 text-white shadow-lg active:bg-indigo-700"
                      : isDark ? "bg-gray-700 hover:bg-gray-600 active:bg-gray-600 text-gray-200" : "bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800"
                  }`}
                aria-label={`Select ${userName}`}
              >
                <div className="flex items-center gap-3 sm:gap-3">
                  <div
                    className={`w-12 h-12 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg font-bold
                      ${
                        selectedUser === userId
                          ? "bg-white text-indigo-600"
                          : "bg-indigo-600 text-white"
                      }`}
                  >
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate">{userName}</p>
                    <p className={`text-xs ${selectedUser === userId ? "text-indigo-100" : "text-gray-500"}`}>
                      {displayId}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className={`text-xs ${selectedUser === userId ? "text-indigo-100" : "text-green-600"}`}>
                      Online
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
