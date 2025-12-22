import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";
import { socketHandler } from "./socket.js";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transfers", transferRoutes);

app.get("/", (req, res) => {
  res.send("Prēṣaṇa Backend Running");
});

// Create HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Socket.IO handler
socketHandler(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
