// Enviroment variables
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./db/connect.js";
import taskRouter from "./routers/taskRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------
// Middleware
// ---------------------------------------------------
app.use(cors());
app.use(express.json());

// ---------------------------------------------------
// Routes
// ---------------------------------------------------
app.use("/api/tasks", taskRouter);

app.get("/", (req, res) => {
  res.send("Hello World! The ToDo API server is running.");
});

// ----------------------------------------------------
// Initialize server
// ----------------------------------------------------
const startServer = async () => {
  try {
    // 1. CONEXIÓN A MONGODB: Esperamos a que la base de datos esté lista
    await connectDB();
    console.log("✅ MongoDB connection established successfully.");

    // 2. INICIO DEL SERVIDOR: Solo si la DB está conectada
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
      console.log(`Access at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to DB or start server:", error);
  }
};

startServer();
