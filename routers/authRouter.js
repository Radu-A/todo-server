import express from "express";
import { checkLogin } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.route("/").post(checkLogin);

export default authRouter;
