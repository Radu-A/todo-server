// Enviroment variables
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const URI = process.env.MONGODB_URI;

console.log(URI);

// ---------------------------------------------------
// Middleware
// ---------------------------------------------------
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World! The ToDo API server is running.");
});

// ----------------------------------------------------
// CONEXIÓN A MONGODB
// ---------------------------------------------------
mongoose.connect(URI).then(() => {
  console.log("✅ MongoDB connection established successfully.");
});

// ----------------------------------------------------
// Initialize server
// ----------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
});
