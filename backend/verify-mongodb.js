import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const verifyDatabase = async () => {
  try {
    console.log("🔍 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    console.log("");

    // Count total users
    const userCount = await User.countDocuments();
    console.log(`📊 Total users in database: ${userCount}`);
    console.log("");

    // Find all users
    if (userCount > 0) {
      console.log("👥 All users:");
      const users = await User.find({}).select("-password"); // Don't show passwords
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User Details:`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Avatar: ${user.avatar || "(none)"}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Updated: ${user.updatedAt}`);
      });
    } else {
      console.log("⚠️  No users found in database");
      console.log("The register API might have failed, or no users have been created yet.");
    }

    console.log("\n✅ Verification complete!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

verifyDatabase();
