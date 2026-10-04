import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";

import {
  searchWorkspaceController,
} from "./search.controller.js";

const router = Router();

router.get(
  "/workspaces/:workspaceId/search",
  requireAuth,
  searchWorkspaceController,
);

export default router;