import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import {
  requireWorkspaceMember,
  requireWorkspaceRole,
} from "../../middleware/workspace.js";
import { validateBody } from "../../middleware/validate.js";

import {
  createProjectController,
  getProjectController,
  getWorkspaceProjectsController,
  updateProjectController,
} from "./project.controller.js";

import { createProjectSchema, updateProjectSchema } from "./project.schema.js";

const router = Router();

router.post(
  "/workspaces/:workspaceId/projects",
  requireAuth,
  requireWorkspaceMember,
  requireWorkspaceRole("ADMIN", "MANAGER"),
  validateBody(createProjectSchema),
  createProjectController,
);

router.get(
  "/workspaces/:workspaceId/projects",
  requireAuth,
  requireWorkspaceMember,
  getWorkspaceProjectsController,
);

router.get("/projects/:projectId", requireAuth, getProjectController);

router.patch(
  "/projects/:projectId",
  requireAuth,
  validateBody(updateProjectSchema),
  updateProjectController,
);

export default router;
