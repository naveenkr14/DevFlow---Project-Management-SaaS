import type { Request, Response } from "express";

import { isValidUUID } from "../../lib/validation.js";

import {
  createIssueService,
  getIssueService,
  getProjectIssuesService,
  updateIssueService,
  updateIssueStatusService,
} from "./issue.service.js";

export const createIssueController = async (
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

    const issue = await createIssueService(
      projectId,
      req.user.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Issue created successfully.",
      data: issue,
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

    if (error instanceof Error && error.message === "ASSIGNEE_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "ASSIGNEE_NOT_FOUND",
          message: "Assignee does not exist.",
        },
      });

      return;
    }

    if (error instanceof Error && error.message === "ASSIGNEE_NOT_MEMBER") {
      res.status(400).json({
        success: false,
        error: {
          code: "ASSIGNEE_NOT_MEMBER",
          message: "Assignee is not a member of the workspace.",
        },
      });

      return;
    }

    console.error("Issue creation failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "ISSUE_CREATION_FAILED",
        message: "Unable to create issue.",
      },
    });
  }
};

export const getProjectIssuesController = async (
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

    const issues = await getProjectIssuesService(
      projectId,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      data: issues,
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

    console.error("Project issues fetch failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "ISSUES_FETCH_FAILED",
        message: "Unable to fetch project issues.",
      },
    });
  }
};

export const getIssueController = async (
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

    const issue = await getIssueService(
      issueId,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      data: issue,
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

    console.error("Issue fetch failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "ISSUE_FETCH_FAILED",
        message: "Unable to fetch issue.",
      },
    });
  }
};

export const updateIssueController = async (
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

    const issue = await updateIssueService(
      issueId,
      req.user.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Issue updated successfully.",
      data: issue,
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

    if (error instanceof Error && error.message === "ASSIGNEE_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "ASSIGNEE_NOT_FOUND",
          message: "Assignee does not exist.",
        },
      });

      return;
    }

    if (error instanceof Error && error.message === "ASSIGNEE_NOT_MEMBER") {
      res.status(400).json({
        success: false,
        error: {
          code: "ASSIGNEE_NOT_MEMBER",
          message: "Assignee is not a member of the workspace.",
        },
      });

      return;
    }

    console.error("Issue update failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "ISSUE_UPDATE_FAILED",
        message: "Unable to update issue.",
      },
    });
  }
};

export const updateIssueStatusController = async (
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

    const issue = await updateIssueStatusService(
      issueId,
      req.user.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Issue status updated successfully.",
      data: issue,
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

    console.error("Issue status update failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "ISSUE_STATUS_UPDATE_FAILED",
        message: "Unable to update issue status.",
      },
    });
  }
};