import type { Request, Response } from "express";

import { isValidUUID } from "../../lib/validation.js";

import {
  createLabelService,
  deleteLabelService,
  getProjectLabelsService,
  updateLabelService,
} from "./label.service.js";

export const createLabelController = async (
  req: Request,
  res: Response,
) => {
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

    const label = await createLabelService(
      projectId,
      req.user.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Label created successfully.",
      data: label,
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

    if (error instanceof Error && error.message === "LABEL_ALREADY_EXISTS") {
      res.status(409).json({
        success: false,
        error: {
          code: "LABEL_ALREADY_EXISTS",
          message: "A label with this name already exists in the project.",
        },
      });

      return;
    }

    console.error("Label creation failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "LABEL_CREATION_FAILED",
        message: "Unable to create label.",
      },
    });
  }
};

export const getProjectLabelsController = async (
  req: Request,
  res: Response,
) => {
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

    const labels = await getProjectLabelsService(
      projectId,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      data: labels,
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

    console.error("Project labels fetch failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "LABELS_FETCH_FAILED",
        message: "Unable to fetch project labels.",
      },
    });
  }
};

export const updateLabelController = async (
  req: Request,
  res: Response,
) => {
  try {
    const labelId = req.params.labelId;

    if (typeof labelId !== "string" || !isValidUUID(labelId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_LABEL_ID",
          message: "Invalid label ID.",
        },
      });

      return;
    }

    const label = await updateLabelService(
      labelId,
      req.user.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Label updated successfully.",
      data: label,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "LABEL_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "LABEL_NOT_FOUND",
          message: "Label does not exist.",
        },
      });

      return;
    }

    if (error instanceof Error && error.message === "WORKSPACE_ACCESS_DENIED") {
      res.status(403).json({
        success: false,
        error: {
          code: "WORKSPACE_ACCESS_DENIED",
          message: "You do not have access to this label.",
        },
      });

      return;
    }

    if (error instanceof Error && error.message === "LABEL_ALREADY_EXISTS") {
      res.status(409).json({
        success: false,
        error: {
          code: "LABEL_ALREADY_EXISTS",
          message: "A label with this name already exists in the project.",
        },
      });

      return;
    }

    console.error("Label update failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "LABEL_UPDATE_FAILED",
        message: "Unable to update label.",
      },
    });
  }
};

export const deleteLabelController = async (
  req: Request,
  res: Response,
) => {
  try {
    const labelId = req.params.labelId;

    if (typeof labelId !== "string" || !isValidUUID(labelId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_LABEL_ID",
          message: "Invalid label ID.",
        },
      });

      return;
    }

    await deleteLabelService(
      labelId,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      message: "Label deleted successfully.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "LABEL_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "LABEL_NOT_FOUND",
          message: "Label does not exist.",
        },
      });

      return;
    }

    if (error instanceof Error && error.message === "WORKSPACE_ACCESS_DENIED") {
      res.status(403).json({
        success: false,
        error: {
          code: "WORKSPACE_ACCESS_DENIED",
          message: "You do not have access to this label.",
        },
      });

      return;
    }

    console.error("Label deletion failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "LABEL_DELETION_FAILED",
        message: "Unable to delete label.",
      },
    });
  }
};