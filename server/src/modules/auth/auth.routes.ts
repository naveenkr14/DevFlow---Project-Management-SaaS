import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { env } from "../../config/env.js";
import { createRateLimiter } from "../../middleware/rate-limit.js";
import { validateBody } from "../../middleware/validate.js";
import { login, logout, register } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

const router = Router();

export const registerRateLimiter = createRateLimiter({
  max: env.registerRateLimitMax,
  windowMs: env.registerRateLimitWindowMs,
});

export const loginRateLimiter = createRateLimiter({
  max: env.loginRateLimitMax,
  windowMs: env.loginRateLimitWindowMs,
});

router.post("/register", registerRateLimiter, validateBody(registerSchema), register);

router.post("/login", loginRateLimiter, validateBody(loginSchema), login);

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
