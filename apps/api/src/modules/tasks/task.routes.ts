import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  createTaskController,
  deleteTaskController,
  listTasksController,
  updateTaskController
} from "./task.controller.js";
import { createTaskSchema, taskFilterSchema, updateTaskSchema } from "./task.schemas.js";

export const taskRoutes = Router();

taskRoutes.use(requireAuth);

taskRoutes.get("/projects/:projectId/tasks", validate(taskFilterSchema, "query"), listTasksController);
taskRoutes.post("/projects/:projectId/tasks", validate(createTaskSchema), createTaskController);
taskRoutes.patch("/tasks/:taskId", validate(updateTaskSchema), updateTaskController);
taskRoutes.delete("/tasks/:taskId", deleteTaskController);
