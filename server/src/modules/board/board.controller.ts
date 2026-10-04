import type { Request, Response } from "express";

import { isValidUUID } from "../../lib/validation.js";

import { getProjectBoardService } from "./board.service.js";

export const getProjectBoardController = async (
  req: Request,
  res: Response,
) => {
  try {
    const projectId = req.params.projectId;

    if (
      typeof projectId !== "string" ||
      !isValidUUID(projectId)
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PROJECT_ID",
          message: "Invalid project ID.",
        },
      });

      return;
    }

    const board = await getProjectBoardService(
      projectId,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      data: board,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "PROJECT_NOT_FOUND"
    ) {
      res.status(404).json({
        success: false,
        error: {
          code: "PROJECT_NOT_FOUND",
          message: "Project does not exist.",
        },
      });

      return;
    }

    if (
      error instanceof Error &&
      error.message === "WORKSPACE_ACCESS_DENIED"
    ) {
      res.status(403).json({
        success: false,
        error: {
          code: "WORKSPACE_ACCESS_DENIED",
          message: "You do not have access to this project.",
        },
      });

      return;
    }

    console.error("Project board fetch failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "BOARD_FETCH_FAILED",
        message: "Unable to fetch project board.",
      },
    });
  }
};