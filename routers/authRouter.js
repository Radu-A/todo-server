import express from "express";
import { checkLogin, googleLogin } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.route("/").post(checkLogin);
authRouter.route("/google").post(googleLogin);

export default authRouter;
