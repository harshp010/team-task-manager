import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { getProjectDashboard } from "./dashboard.service.js";

export const getProjectDashboardController = asyncHandler(
  async (req: Request, res: Response) => {
    const dashboard = await getProjectDashboard(req.params.projectId, req.user!.id);
    res.json({ dashboard });
  }
);
