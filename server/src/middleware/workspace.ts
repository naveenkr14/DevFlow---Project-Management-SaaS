import type { Request, Response, NextFunction } from "express";
import { WorkspaceRole } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { isValidUUID } from "../lib/validation.js";

export const requireWorkspaceMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
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

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: req.user.id,
        },
      },
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        error: {
          code: "WORKSPACE_ACCESS_DENIED",
          message: "You are not a member of this workspace.",
        },
      });

      return;
    }

    req.workspaceMembership = membership;

    next();
  } catch (error) {
    console.error("Workspace authorization failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "WORKSPACE_AUTHORIZATION_FAILED",
        message: "Unable to verify workspace access.",
      },
    });
  }
};

export const requireWorkspaceRole = (
  ...allowedRoles: WorkspaceRole[]
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.workspaceMembership) {
      res.status(403).json({
        success: false,
        error: {
          code: "WORKSPACE_ACCESS_DENIED",
          message: "Workspace membership is required.",
        },
      });

      return;
    }

    if (!allowedRoles.includes(req.workspaceMembership.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: "INSUFFICIENT_WORKSPACE_ROLE",
          message: "You do not have permission for this action.",
        },
      });

      return;
    }

    next();
  };
};