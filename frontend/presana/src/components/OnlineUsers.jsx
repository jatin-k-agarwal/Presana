export default function OnlineUsers({ users, selectedUser, onSelectUser }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">👥</span>
        Online Users ({users.length})
      </h2>

      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-2">😔</p>
          <p>No users online</p>
          <p className="text-sm mt-1">Waiting for others to join...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((userInfo) => {
            const userId = userInfo._id;
            const userName = userInfo.name || 'Unknown User';
            const displayId = userInfo.userId || `ID: ${userId.substring(0, 8)}...`;
            const userEmail = userInfo.email;
            
            return (
              <button
                key={userId}
                onClick={() => onSelectUser(userId)}
                className={`w-full p-4 rounded-xl text-left transition
                  ${
                    selectedUser === userId
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                      ${
                        selectedUser === userId
                          ? "bg-white text-indigo-600"
                          : "bg-indigo-600 text-white"
                      }`}
                  >
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-base">{userName}</p>
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
