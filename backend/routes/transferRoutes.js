import express from "express";
import mongoose from "mongoose";
import Transfer from "../models/Transfer.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// LOG TRANSFER (Protected)
router.post("/log", protect, async (req, res) => {
  try {
    const { receiver, fileName, fileSize, fileType, status } = req.body;

    const transfer = await Transfer.create({
      sender: req.user.id,
      receiver,
      fileName,
      fileSize,
      fileType,
      status: status || "completed",
    });

    res.status(201).json(transfer);
  } catch (error) {
    console.error("Transfer log error:", error);
    res.status(500).json("Failed to log transfer");
  }
});

// GET USER'S TRANSFER HISTORY (Protected)
router.get("/history", protect, async (req, res) => {
  try {
    const transfers = await Transfer.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    })
      .populate("sender", "name email userId")
      .populate("receiver", "name email userId")
      .sort({ createdAt: -1 })
      .limit(100); // Last 100 transfers

    res.json(transfers);
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json("Failed to get transfer history");
  }
});

// GET TRANSFER STATS (Protected)
router.get("/stats", protect, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const sent = await Transfer.countDocuments({ sender: userId });
    const received = await Transfer.countDocuments({ receiver: userId });
    const totalSize = await Transfer.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId }
          ],
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$fileSize" },
        },
      },
    ]);

    res.json({
      sent,
      received,
      total: sent + received,
      totalSize: totalSize[0]?.total || 0,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json("Failed to get stats");
  }
});

export default router;
