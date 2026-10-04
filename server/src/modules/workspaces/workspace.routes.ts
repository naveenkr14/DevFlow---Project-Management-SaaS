import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  requireWorkspaceMember,
  requireWorkspaceRole,
} from "../../middleware/workspace.js";
import { validateBody } from "../../middleware/validate.js";
import {
  addWorkspaceMemberController,
  createWorkspaceController,
  getWorkspaceBySlugController,
  getWorkspaceController,
  getWorkspaceMembersController,
  removeWorkspaceMemberController,
  updateWorkspaceMemberController,
} from "./workspace.controller.js";
import {
  addWorkspaceMemberSchema,
  createWorkspaceSchema,
  updateWorkspaceMemberSchema,
} from "./workspace.schema.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  validateBody(createWorkspaceSchema),
  createWorkspaceController,
);

router.get(
  "/slug/:workspaceSlug",
  requireAuth,
  getWorkspaceBySlugController,
);

router.get(
  "/:workspaceId",
  requireAuth,
  requireWorkspaceMember,
  getWorkspaceController,
);

router.get(
  "/:workspaceId/members",
  requireAuth,
  requireWorkspaceMember,
  getWorkspaceMembersController,
);

router.post(
  "/:workspaceId/members",
  requireAuth,
  requireWorkspaceMember,
  requireWorkspaceRole("ADMIN", "MANAGER"),
  validateBody(addWorkspaceMemberSchema),
  addWorkspaceMemberController,
);

router.patch(
  "/:workspaceId/members/:userId",
  requireAuth,
  requireWorkspaceMember,
  requireWorkspaceRole("ADMIN", "MANAGER"),
  validateBody(updateWorkspaceMemberSchema),
  updateWorkspaceMemberController,
);

router.delete(
  "/:workspaceId/members/:userId",
  requireAuth,
  requireWorkspaceMember,
  requireWorkspaceRole("ADMIN", "MANAGER"),
  removeWorkspaceMemberController,
);

export default router;
