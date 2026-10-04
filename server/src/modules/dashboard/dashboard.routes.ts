import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";

import {
  getWorkspaceDashboardController,
} from "./dashboard.controller.js";

const router = Router();

router.get(
  "/workspaces/:workspaceId/dashboard",
  requireAuth,
  getWorkspaceDashboardController,
);

export default router;