import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";

import {
  getProjectBoardController,
} from "./board.controller.js";

const router = Router();

router.get(
  "/projects/:projectId/board",
  requireAuth,
  getProjectBoardController,
);

export default router;