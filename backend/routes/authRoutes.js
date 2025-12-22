import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json("User exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashedPassword });

  res.json("Registered successfully");
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json("Invalid credentials");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token, user });
});

// UPDATE PROFILE (Protected)
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    // Get current user to compare email
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json("User not found");
    }

    // Check if email is being changed and if it's already taken by another user
    if (email && email !== currentUser.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json("Email already in use");
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, avatar },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json("Failed to update profile");
  }
});

// SEARCH USERS (Protected)
router.get("/search", protect, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === "") {
      return res.json([]);
    }

    // Search by name or userId (case-insensitive, partial match)
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } }, // Exclude current user
        {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { userId: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
      ],
    })
      .select("-password")
      .limit(20); // Limit to 20 results

    res.json(users);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json("Search failed");
  }
});

export default router;
