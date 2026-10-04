import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { getUsersController } from "./user.controller.js";

const router = Router();

router.get("/", requireAuth, getUsersController);

export default router;
