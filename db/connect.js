import mongoose, { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const URI = process.env.MONGODB_URI;

const connectDB = () => {
  if (!URI) {
    console.error("❌ MONGODB_URI not found in environment variables.");
    process.exit(1); // Sale del proceso si falta la variable crucial
  } // Retorna la promesa de conexión
  return mongoose.connect(URI);
};

export default connectDB;
