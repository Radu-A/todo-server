import express from "express";
import { getTasks, createTask } from "../controllers/taskController.js";

const taskRouter = express.Router();

taskRouter.route("/").get(getTasks).post(createTask);

export default taskRouter;
