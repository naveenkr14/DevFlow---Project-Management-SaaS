import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";

import {
  createIssueController,
  getProjectIssuesController,
  getIssueController,
  updateIssueController,
  updateIssueStatusController,
} from "./issue.controller.js";

import {
  createIssueSchema,
  updateIssueSchema,
} from "./issue.schema.js";

import {
  updateIssueStatusSchema,
} from "./issue-status.schema.js";

const router = Router();

router.post(
  "/projects/:projectId/issues",
  requireAuth,
  validateBody(createIssueSchema),
  createIssueController,
);

router.get(
  "/projects/:projectId/issues",
  requireAuth,
  getProjectIssuesController,
);

router.get(
  "/issues/:issueId",
  requireAuth,
  getIssueController,
);

router.patch(
  "/issues/:issueId",
  requireAuth,
  validateBody(updateIssueSchema),
  updateIssueController,
);

router.patch(
  "/issues/:issueId/status",
  requireAuth,
  validateBody(updateIssueStatusSchema),
  updateIssueStatusController,
);

export default router;