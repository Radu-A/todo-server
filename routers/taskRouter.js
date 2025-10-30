import express from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  reorderTask,
} from "../controllers/taskController.js";
import { protect } from "../middlewares/authenticate.js";

const taskRouter = express.Router();

taskRouter.route("/").get(protect, getTasks).post(protect, createTask);

taskRouter.route("/:id").delete(protect, deleteTask).patch(protect, updateTask);

taskRouter.route("/:id/reorder").patch(protect, reorderTask);

export default taskRouter;
