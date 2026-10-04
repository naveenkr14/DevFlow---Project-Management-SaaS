import type { Request, Response } from "express";

import { isValidUUID } from "../../lib/validation.js";

import {
  addLabelToIssueService,
  getIssueLabelsService,
  removeLabelFromIssueService,
} from "./issue-label.service.js";

export const addLabelToIssueController = async (
  req: Request,
  res: Response,
) => {
  try {
    const issueId = req.params.issueId;

    if (typeof issueId !== "string" || !isValidUUID(issueId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ISSUE_ID",
          message: "Invalid issue ID.",
        },
      });

      return;
    }

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

    const issueLabel = await addLabelToIssueService(
      issueId,
      labelId,
      req.user.id,
    );

    res.status(201).json({
      success: true,
      message: "Label added to issue successfully.",
      data: issueLabel,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ISSUE_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "ISSUE_NOT_FOUND",
          message: "Issue does not exist.",
        },
      });

      return;
    }

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
          message: "You do not have access to this issue.",
        },
      });

      return;
    }

    if (error instanceof Error && error.message === "LABEL_PROJECT_MISMATCH") {
      res.status(400).json({
        success: false,
        error: {
          code: "LABEL_PROJECT_MISMATCH",
          message: "Label does not belong to the issue's project.",
        },
      });

      return;
    }

    if (error instanceof Error && error.message === "LABEL_ALREADY_ATTACHED") {
      res.status(409).json({
        success: false,
        error: {
          code: "LABEL_ALREADY_ATTACHED",
          message: "Label is already attached to this issue.",
        },
      });

      return;
    }

    console.error("Adding label to issue failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "ISSUE_LABEL_CREATION_FAILED",
        message: "Unable to add label to issue.",
      },
    });
  }
};

export const getIssueLabelsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const issueId = req.params.issueId;

    if (typeof issueId !== "string" || !isValidUUID(issueId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ISSUE_ID",
          message: "Invalid issue ID.",
        },
      });

      return;
    }

    const labels = await getIssueLabelsService(
      issueId,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      data: labels,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ISSUE_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "ISSUE_NOT_FOUND",
          message: "Issue does not exist.",
        },
      });

      return;
    }

    if (error instanceof Error && error.message === "WORKSPACE_ACCESS_DENIED") {
      res.status(403).json({
        success: false,
        error: {
          code: "WORKSPACE_ACCESS_DENIED",
          message: "You do not have access to this issue.",
        },
      });

      return;
    }

    console.error("Issue labels fetch failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "ISSUE_LABELS_FETCH_FAILED",
        message: "Unable to fetch issue labels.",
      },
    });
  }
};

export const removeLabelFromIssueController = async (
  req: Request,
  res: Response,
) => {
  try {
    const issueId = req.params.issueId;

    if (typeof issueId !== "string" || !isValidUUID(issueId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ISSUE_ID",
          message: "Invalid issue ID.",
        },
      });

      return;
    }

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

    await removeLabelFromIssueService(
      issueId,
      labelId,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      message: "Label removed from issue successfully.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ISSUE_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "ISSUE_NOT_FOUND",
          message: "Issue does not exist.",
        },
      });

      return;
    }

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
          message: "You do not have access to this issue.",
        },
      });

      return;
    }

    if (error instanceof Error && error.message === "ISSUE_LABEL_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "ISSUE_LABEL_NOT_FOUND",
          message: "This label is not attached to the issue.",
        },
      });

      return;
    }

    console.error("Removing label from issue failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "ISSUE_LABEL_DELETION_FAILED",
        message: "Unable to remove label from issue.",
      },
    });
  }
};