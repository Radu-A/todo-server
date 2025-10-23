import express from "express";
import {
  getTasks,
  createTask,
  deleteTask,
} from "../controllers/taskController.js";

const taskRouter = express.Router();

taskRouter.route("/").get(getTasks).post(createTask);

taskRouter.route("/:id").delete(deleteTask);

export default taskRouter;
