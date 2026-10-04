import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";

import {
  addLabelToIssueController,
  getIssueLabelsController,
  removeLabelFromIssueController,
} from "./issue-label.controller.js";

const router = Router();

router.post(
  "/issues/:issueId/labels/:labelId",
  requireAuth,
  addLabelToIssueController,
);

router.get(
  "/issues/:issueId/labels",
  requireAuth,
  getIssueLabelsController,
);

router.delete(
  "/issues/:issueId/labels/:labelId",
  requireAuth,
  removeLabelFromIssueController,
);

export default router;