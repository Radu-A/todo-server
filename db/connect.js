import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const URI = process.env.MONGODB_URI;

const connectDB = () => {
  if (!URI) {
    console.error("❌ MONGODB_URI not found in environment variables.");
    // Exit the process with a failure code if the critical variable is missing
    process.exit(1);
  }
  return mongoose.connect(URI);
};

export default connectDB;