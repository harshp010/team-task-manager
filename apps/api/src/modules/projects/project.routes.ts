import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  addMemberController,
  createProjectController,
  deleteProjectController,
  getProjectController,
  listMembersController,
  listProjectsController,
  removeMemberController,
  updateProjectController
} from "./project.controller.js";
import { addMemberSchema, createProjectSchema, updateProjectSchema } from "./project.schemas.js";

export const projectRoutes = Router();

projectRoutes.use(requireAuth);

projectRoutes.get("/", listProjectsController);
projectRoutes.post("/", validate(createProjectSchema), createProjectController);
projectRoutes.get("/:projectId", getProjectController);
projectRoutes.patch("/:projectId", validate(updateProjectSchema), updateProjectController);
projectRoutes.delete("/:projectId", deleteProjectController);
projectRoutes.get("/:projectId/members", listMembersController);
projectRoutes.post("/:projectId/members", validate(addMemberSchema), addMemberController);
projectRoutes.delete("/:projectId/members/:userId", removeMemberController);
