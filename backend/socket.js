import User from "./models/User.js";

export const socketHandler = (io) => {
  const onlineUsers = {}; // { userId: { socketId, userInfo } }

  io.on("connection", (socket) => {
    socket.on("join", async (userId) => {
      try {
        // Fetch user details from database
        const user = await User.findById(userId).select("-password");
        
        if (user) {
          onlineUsers[userId] = {
            socketId: socket.id,
            userInfo: {
              _id: user._id,
              name: user.name,
              userId: user.userId,
              avatar: user.avatar,
            },
          };

          // Broadcast updated online users list with full user info
          const onlineUsersList = Object.values(onlineUsers).map((u) => u.userInfo);
          io.emit("online-users", onlineUsersList);
        }
      } catch (error) {
        console.error("Join error:", error);
      }
    });

    // File metadata (name, size, type)
    socket.on("file-meta", ({ to, meta }) => {
      const targetUser = onlineUsers[to];
      if (targetUser) {
        io.to(targetUser.socketId).emit("file-meta", meta);
      }
    });

    // Individual file chunk
    socket.on("file-chunk", ({ to, chunk }) => {
      const targetUser = onlineUsers[to];
      if (targetUser) {
        io.to(targetUser.socketId).emit("file-chunk", chunk);
      }
    });

    // File transfer complete
    socket.on("file-complete", ({ to }) => {
      const targetUser = onlineUsers[to];
      if (targetUser) {
        io.to(targetUser.socketId).emit("file-complete");
      }
    });

    socket.on("disconnect", () => {
      // Remove disconnected user
      for (let key in onlineUsers) {
        if (onlineUsers[key].socketId === socket.id) {
          delete onlineUsers[key];
        }
      }
      
      // Broadcast updated list
      const onlineUsersList = Object.values(onlineUsers).map((u) => u.userInfo);
      io.emit("online-users", onlineUsersList);
    });
  });
};
