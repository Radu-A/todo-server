// Environment variables
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./db/connect.js";
import taskRouter from "./routers/taskRouter.js";
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. CORS Configuration Options
const corsOptions = {
  // Whitelist specific origins (localhost and Vercel deployment)
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://todo-list-tau-ten-35.vercel.app",
  ],
  // Allow the methods you use: GET, POST, PUT, DELETE
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  // Allow necessary headers, including 'Content-Type' and 'Authorization'
  allowedHeaders: "Content-Type,Authorization",
  // Enable credentials (if using cookies/sessions)
  credentials: true,
};

// ---------------------------------------------------
// Middleware
// ---------------------------------------------------
app.use(cors(corsOptions));
app.use(
  helmet({
    crossOriginOpenerPolicy: "same-origin-allow-popups",
  })
);
app.use(express.json()); // Parses incoming JSON payloads

// ---------------------------------------------------
// Routes
// ---------------------------------------------------
app.use(`/api/tasks`, taskRouter);
app.use(`/api/auth`, authRouter);
app.use(`/api/user`, userRouter);

// Root route
app.get("/", (req, res) => {
  res.send("Hello World! The ToDo API server is running.");
});

// ----------------------------------------------------
// Initialize server
// ----------------------------------------------------
const startServer = async () => {
  try {
    // 1. Connect to MongoDB (await)
    await connectDB();
    console.log("✅ MongoDB connection established successfully.");

    // 2. Start the server (only if DB connection is successful)
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
      console.log(`Access at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to DB or start server:", error);
  }
};

startServer();
