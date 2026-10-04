import type { Request, Response } from "express";

import { isValidUUID } from "../../lib/validation.js";

import { searchWorkspaceService } from "./search.service.js";

export const searchWorkspaceController = async (
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

    const rawQuery = req.query.q;

    if (typeof rawQuery !== "string") {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_SEARCH_QUERY",
          message: "Search query must be provided using q parameter.",
        },
      });

      return;
    }

    const query = rawQuery.trim();

    if (query.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_SEARCH_QUERY",
          message: "Search query must not be empty.",
        },
      });

      return;
    }

    if (query.length > 100) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_SEARCH_QUERY",
          message: "Search query must not exceed 100 characters.",
        },
      });

      return;
    }

    const result = await searchWorkspaceService(
      workspaceId,
      req.user.id,
      query,
    );

    res.status(200).json({
      success: true,
      data: result,
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

    if (
      error instanceof Error &&
      error.message === "EMPTY_SEARCH_QUERY"
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_SEARCH_QUERY",
          message: "Search query must not be empty.",
        },
      });

      return;
    }

    console.error("Workspace search failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "SEARCH_FAILED",
        message: "Unable to perform workspace search.",
      },
    });
  }
};