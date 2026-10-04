import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";

import {
  createCommentController,
  getIssueCommentsController,
  updateCommentController,
  deleteCommentController,
} from "./comment.controller.js";

import {
  createCommentSchema,
  updateCommentSchema,
} from "./comment.schema.js";

const router = Router();

router.post(
  "/issues/:issueId/comments",
  requireAuth,
  validateBody(createCommentSchema),
  createCommentController,
);

router.get(
  "/issues/:issueId/comments",
  requireAuth,
  getIssueCommentsController,
);

router.patch(
  "/comments/:commentId",
  requireAuth,
  validateBody(updateCommentSchema),
  updateCommentController,
);

router.delete(
  "/comments/:commentId",
  requireAuth,
  deleteCommentController,
);

export default router;