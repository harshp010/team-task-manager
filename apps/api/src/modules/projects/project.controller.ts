import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  addProjectMember,
  createProject,
  deleteProject,
  getProject,
  listProjectMembers,
  listProjects,
  removeProjectMember,
  updateProject
} from "./project.service.js";

export const listProjectsController = asyncHandler(async (req: Request, res: Response) => {
  const projects = await listProjects(req.user!.id);
  res.json({ projects });
});

export const createProjectController = asyncHandler(async (req: Request, res: Response) => {
  const project = await createProject(req.user!.id, req.body);
  res.status(201).json({ project });
});

export const getProjectController = asyncHandler(async (req: Request, res: Response) => {
  const project = await getProject(req.params.projectId, req.user!.id);
  res.json({ project });
});

export const updateProjectController = asyncHandler(async (req: Request, res: Response) => {
  const project = await updateProject(req.params.projectId, req.user!.id, req.body);
  res.json({ project });
});

export const deleteProjectController = asyncHandler(async (req: Request, res: Response) => {
  await deleteProject(req.params.projectId, req.user!.id);
  res.status(204).send();
});

export const listMembersController = asyncHandler(async (req: Request, res: Response) => {
  const members = await listProjectMembers(req.params.projectId, req.user!.id);
  res.json({ members });
});

export const addMemberController = asyncHandler(async (req: Request, res: Response) => {
  const member = await addProjectMember(req.params.projectId, req.user!.id, req.body);
  res.status(201).json({ member });
});

export const removeMemberController = asyncHandler(async (req: Request, res: Response) => {
  await removeProjectMember(req.params.projectId, req.user!.id, req.params.userId);
  res.status(204).send();
});
