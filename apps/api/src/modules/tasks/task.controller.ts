import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { createTask, deleteTask, listTasks, updateTask } from "./task.service.js";

export const listTasksController = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await listTasks(req.params.projectId, req.user!.id, req.query);
  res.json({ tasks });
});

export const createTaskController = asyncHandler(async (req: Request, res: Response) => {
  const task = await createTask(req.params.projectId, req.user!.id, req.body);
  res.status(201).json({ task });
});

export const updateTaskController = asyncHandler(async (req: Request, res: Response) => {
  const task = await updateTask(req.params.taskId, req.user!.id, req.body);
  res.json({ task });
});

export const deleteTaskController = asyncHandler(async (req: Request, res: Response) => {
  await deleteTask(req.params.taskId, req.user!.id);
  res.status(204).send();
});
