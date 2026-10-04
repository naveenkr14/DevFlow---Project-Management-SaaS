import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";

import {
  createLabelController,
  getProjectLabelsController,
  updateLabelController,
  deleteLabelController,
} from "./label.controller.js";

import {
  createLabelSchema,
  updateLabelSchema,
} from "./label.schema.js";

const router = Router();

router.post(
  "/projects/:projectId/labels",
  requireAuth,
  validateBody(createLabelSchema),
  createLabelController,
);

router.get(
  "/projects/:projectId/labels",
  requireAuth,
  getProjectLabelsController,
);

router.patch(
  "/labels/:labelId",
  requireAuth,
  validateBody(updateLabelSchema),
  updateLabelController,
);

router.delete(
  "/labels/:labelId",
  requireAuth,
  deleteLabelController,
);

export default router;