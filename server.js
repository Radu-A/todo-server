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
    "https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?as=qHr4F9Yt_tiXM6kIST2sFcowj_cTxGaWXITLGiSu78U&client_id=800527968947-5qmk9dg990v49s19kho4dtj96eudvuiv.apps.googleusercontent.com&scope=openid%20email%20profile&response_type=id_token&gsiwebsdk=gis_attributes&redirect_uri=gis_transform&response_mode=form_post&origin=https%3A%2F%2Ftodo-list-tau-ten-35.vercel.app&display=popup&prompt=select_account&gis_params=CidodHRwczovL3RvZG8tbGlzdC10YXUtdGVuLTM1LnZlcmNlbC5hcHASDWdpc190cmFuc2Zvcm0YByorcUhyNEY5WXRfdGlYTTZrSVNUMnNGY293al9jVHhHYVdYSVRMR2lTdTc4VTJIODAwNTI3OTY4OTQ3LTVxbWs5ZGc5OTB2NDlzMTlraG80ZHRqOTZldWR2dWl2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tOAFCQDIzMGFlOGRiNDM2OWU2NzQyNzlhYzMwNzgwMzA3NDlkN2FjNDk1Y2Q4NjEwMDBiMDcwZDFjZTgzZjVmN2Q0ZTY&service=lso&o2v=1&flowName=GeneralOAuthFlow",
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
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false, // 👈 Desactiva COEP (evita el bloqueo en móviles)
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
