// Enviroment variables
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./db/connect.js";
import taskRouter from "./routers/taskRouter.js";
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Opciones de configuración de CORS
const corsOptions = {
  // Permite peticiones SÓLO desde tu frontend (puerto 5500)
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://todo-list-tau-ten-35.vercel.app/",
    // <-- Add this one
  ],
  // Permite los métodos que usas: GET, POST, PUT, DELETE
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  // Permite encabezados necesarios, incluyendo 'Content-Type' y, más tarde, 'Authorization'
  allowedHeaders: "Content-Type,Authorization",
  // Habilita el manejo de credenciales (si usaras cookies)
  credentials: true,
};

// ---------------------------------------------------
// Middleware
// ---------------------------------------------------
app.use(cors(corsOptions));
app.use(express.json());

// ---------------------------------------------------
// Routes
// ---------------------------------------------------
app.use(`/api/tasks`, taskRouter);
app.use(`/api/auth`, authRouter);
app.use(`/api/user`, userRouter);

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
