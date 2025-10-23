import express from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

const taskRouter = express.Router();

taskRouter.route("/").get(getTasks).post(createTask);

taskRouter.route("/:id").delete(deleteTask).patch(updateTask);

export default taskRouter;
