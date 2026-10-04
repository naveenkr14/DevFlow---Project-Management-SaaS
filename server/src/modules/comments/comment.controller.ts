import type { Request, Response } from "express";

import { isValidUUID } from "../../lib/validation.js";

import {
  createCommentService,
  deleteCommentService,
  getIssueCommentsService,
  updateCommentService,
} from "./comment.service.js";
import { getCommentAuthorizationError } from "./comment.errors.js";

export const createCommentController = async (
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

    const comment = await createCommentService(
      issueId,
      req.user.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Comment created successfully.",
      data: comment,
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

    console.error("Comment creation failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "COMMENT_CREATION_FAILED",
        message: "Unable to create comment.",
      },
    });
  }
};

export const getIssueCommentsController = async (
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

    const comments = await getIssueCommentsService(
      issueId,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      data: comments,
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

    console.error("Issue comments fetch failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "COMMENTS_FETCH_FAILED",
        message: "Unable to fetch issue comments.",
      },
    });
  }
};

export const updateCommentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const commentId = req.params.commentId;

    if (typeof commentId !== "string" || !isValidUUID(commentId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_COMMENT_ID",
          message: "Invalid comment ID.",
        },
      });

      return;
    }

    const comment = await updateCommentService(
      commentId,
      req.user.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Comment updated successfully.",
      data: comment,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "COMMENT_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "COMMENT_NOT_FOUND",
          message: "Comment does not exist.",
        },
      });

      return;
    }

    const authorizationError = getCommentAuthorizationError(error, "update");

    if (authorizationError) {
      res.status(authorizationError.status).json({
        success: false,
        error: authorizationError.error,
      });
      return;
    }

    console.error("Comment update failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "COMMENT_UPDATE_FAILED",
        message: "Unable to update comment.",
      },
    });
  }
};

export const deleteCommentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const commentId = req.params.commentId;

    if (typeof commentId !== "string" || !isValidUUID(commentId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_COMMENT_ID",
          message: "Invalid comment ID.",
        },
      });

      return;
    }

    await deleteCommentService(
      commentId,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "COMMENT_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "COMMENT_NOT_FOUND",
          message: "Comment does not exist.",
        },
      });

      return;
    }

    const authorizationError = getCommentAuthorizationError(error, "delete");

    if (authorizationError) {
      res.status(authorizationError.status).json({
        success: false,
        error: authorizationError.error,
      });
      return;
    }

    console.error("Comment deletion failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "COMMENT_DELETION_FAILED",
        message: "Unable to delete comment.",
      },
    });
  }
};
