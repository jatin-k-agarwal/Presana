import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" }
  },
  { timestamps: true }
);

// Generate unique userId before saving
userSchema.pre('save', async function() {
  if (this.isNew && !this.userId) {
    // Generate random 8-character alphanumeric ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'USR';
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.userId = id;
  }
});

export default mongoose.model("User", userSchema);
