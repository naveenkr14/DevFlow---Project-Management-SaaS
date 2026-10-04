import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import healthRoutes from "../modules/health/health.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import workspaceRoutes from "../modules/workspaces/workspace.routes.js";
import projectRoutes from "../modules/projects/project.routes.js";
import issueRoutes from "../modules/issues/issue.routes.js";
import commentRoutes from "../modules/comments/comment.routes.js";
import labelRoutes from "../modules/labels/label.routes.js";
import issueLabelRoutes from "../modules/issue-labels/issue-label.routes.js";
import activityRoutes from "../modules/activities/activity.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";
import boardRoutes from "../modules/board/board.routes.js";
import searchRoutes from "../modules/search/search.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/workspaces", workspaceRoutes);

router.use("/", projectRoutes);
router.use("/", issueRoutes);
router.use("/", commentRoutes);
router.use("/", labelRoutes);
router.use("/", issueLabelRoutes);
router.use("/", activityRoutes);
router.use("/", dashboardRoutes);
router.use("/", boardRoutes);
router.use("/", searchRoutes);

export default router;