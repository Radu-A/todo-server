import express from "express";
import { createUser, searchEmail } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.route("/").post(createUser);
userRouter.route("/email").post(searchEmail);

export default userRouter;
