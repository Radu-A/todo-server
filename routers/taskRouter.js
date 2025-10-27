import express from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { protect } from "../middlewares/authenticate.js";

const taskRouter = express.Router();

taskRouter.route("/").get(protect, getTasks).post(createTask);

taskRouter.route("/:id").delete(deleteTask).patch(updateTask);

export default taskRouter;
