import type { Request, Response } from "express";

import { isValidUUID } from "../../lib/validation.js";

import {
  createProjectService,
  getProjectService,
  getWorkspaceProjectsService,
  updateProjectService,
} from "./project.service.js";

export const createProjectController = async (req: Request, res: Response) => {
  try {
    const workspaceId = req.params.workspaceId;

    if (typeof workspaceId !== "string" || !isValidUUID(workspaceId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_WORKSPACE_ID",
          message: "Invalid workspace ID.",
        },
      });

      return;
    }

    const project = await createProjectService(
      workspaceId,
      req.user.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Project created successfully.",
      data: project,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "WORKSPACE_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "WORKSPACE_NOT_FOUND",
          message: "Workspace does not exist.",
        },
      });

      return;
    }

    if (error instanceof Error && error.message === "WORKSPACE_ACCESS_DENIED") {
      res.status(403).json({
        success: false,
        error: {
          code: "WORKSPACE_ACCESS_DENIED",
          message: "You are not a member of this workspace.",
        },
      });

      return;
    }

    if (
      error instanceof Error &&
      error.message === "INSUFFICIENT_WORKSPACE_ROLE"
    ) {
      res.status(403).json({
        success: false,
        error: {
          code: "INSUFFICIENT_WORKSPACE_ROLE",
          message: "You do not have permission to create projects.",
        },
      });

      return;
    }

    if (
      error instanceof Error &&
      error.message === "PROJECT_KEY_ALREADY_EXISTS"
    ) {
      res.status(409).json({
        success: false,
        error: {
          code: "PROJECT_KEY_ALREADY_EXISTS",
          message: "A project with this key already exists in this workspace.",
        },
      });

      return;
    }

    console.error("Project creation failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "PROJECT_CREATION_FAILED",
        message: "Unable to create project.",
      },
    });
  }
};

export const getWorkspaceProjectsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const workspaceId = req.params.workspaceId;

    if (typeof workspaceId !== "string" || !isValidUUID(workspaceId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_WORKSPACE_ID",
          message: "Invalid workspace ID.",
        },
      });

      return;
    }

    const projects = await getWorkspaceProjectsService(
      workspaceId,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "WORKSPACE_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "WORKSPACE_NOT_FOUND",
          message: "Workspace does not exist.",
        },
      });

      return;
    }

    if (error instanceof Error && error.message === "WORKSPACE_ACCESS_DENIED") {
      res.status(403).json({
        success: false,
        error: {
          code: "WORKSPACE_ACCESS_DENIED",
          message: "You are not a member of this workspace.",
        },
      });

      return;
    }

    console.error("Workspace projects fetch failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "PROJECTS_FETCH_FAILED",
        message: "Unable to fetch workspace projects.",
      },
    });
  }
};

export const getProjectController = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId;

    if (typeof projectId !== "string" || !isValidUUID(projectId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PROJECT_ID",
          message: "Invalid project ID.",
        },
      });

      return;
    }

    const project = await getProjectService(projectId, req.user.id);

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "PROJECT_NOT_FOUND",
          message: "Project does not exist.",
        },
      });

      return;
    }

    if (error instanceof Error && error.message === "WORKSPACE_ACCESS_DENIED") {
      res.status(403).json({
        success: false,
        error: {
          code: "WORKSPACE_ACCESS_DENIED",
          message: "You do not have access to this project.",
        },
      });

      return;
    }

    console.error("Project fetch failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "PROJECT_FETCH_FAILED",
        message: "Unable to fetch project.",
      },
    });
  }
};

export const updateProjectController = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId;

    if (typeof projectId !== "string" || !isValidUUID(projectId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PROJECT_ID",
          message: "Invalid project ID.",
        },
      });

      return;
    }

    const project = await updateProjectService(
      projectId,
      req.user.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      data: project,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "PROJECT_NOT_FOUND",
          message: "Project does not exist.",
        },
      });

      return;
    }

    if (error instanceof Error && error.message === "WORKSPACE_ACCESS_DENIED") {
      res.status(403).json({
        success: false,
        error: {
          code: "WORKSPACE_ACCESS_DENIED",
          message: "You do not have access to this project.",
        },
      });

      return;
    }

    if (
      error instanceof Error &&
      error.message === "INSUFFICIENT_WORKSPACE_ROLE"
    ) {
      res.status(403).json({
        success: false,
        error: {
          code: "INSUFFICIENT_WORKSPACE_ROLE",
          message: "You do not have permission to update projects.",
        },
      });

      return;
    }

    console.error("Project update failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "PROJECT_UPDATE_FAILED",
        message: "Unable to update project.",
      },
    });
  }
};