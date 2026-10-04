import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import { login, logout, register } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

const router = Router();

router.post("/register", validateBody(registerSchema), register);

router.post("/login", validateBody(loginSchema), login);

router.post("/logout", requireAuth, logout);

router.get("/me", requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
});

export default router;
