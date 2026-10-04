import type { Request, Response } from "express";

import { isValidUUID } from "../../lib/validation.js";

import { getWorkspaceDashboardService } from "./dashboard.service.js";

export const getWorkspaceDashboardController = async (
  req: Request,
  res: Response,
) => {
  try {
    const workspaceId = req.params.workspaceId;

    if (
      typeof workspaceId !== "string" ||
      !isValidUUID(workspaceId)
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_WORKSPACE_ID",
          message: "Invalid workspace ID.",
        },
      });

      return;
    }

    const dashboard = await getWorkspaceDashboardService(
      workspaceId,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "WORKSPACE_ACCESS_DENIED"
    ) {
      res.status(403).json({
        success: false,
        error: {
          code: "WORKSPACE_ACCESS_DENIED",
          message: "You do not have access to this workspace.",
        },
      });

      return;
    }

    console.error("Workspace dashboard fetch failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "DASHBOARD_FETCH_FAILED",
        message: "Unable to fetch workspace dashboard.",
      },
    });
  }
};