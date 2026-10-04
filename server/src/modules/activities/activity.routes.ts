import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";

import {
  getEntityActivitiesController,
  getMyActivitiesController,
  getWorkspaceActivitiesController,
} from "./activity.controller.js";

const router = Router();

router.get(
  "/activities/me",
  requireAuth,
  getMyActivitiesController,
);

router.get(
  "/activities/:entityType/:entityId",
  requireAuth,
  getEntityActivitiesController,
);

router.get(
  "/workspaces/:workspaceId/activities",
  requireAuth,
  getWorkspaceActivitiesController,
);

export default router;