import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { getProjectDashboardController } from "./dashboard.controller.js";

export const dashboardRoutes = Router();

dashboardRoutes.use(requireAuth);

dashboardRoutes.get("/:projectId/dashboard", getProjectDashboardController);
