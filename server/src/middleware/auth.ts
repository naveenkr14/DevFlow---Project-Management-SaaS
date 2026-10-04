import type { Request, Response, NextFunction } from "express";
import { findSessionByTokenHash } from "../modules/auth/auth.repository.js";
import { hashSessionToken } from "../lib/session.js";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.devflow_session;

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication required.",
        },
      });

      return;
    }

    const tokenHash = hashSessionToken(token);

    const session = await findSessionByTokenHash(tokenHash);

    if (!session) {
      res.status(401).json({
        success: false,
        error: {
          code: "INVALID_SESSION",
          message: "Invalid or expired session.",
        },
      });

      return;
    }

    if (session.expiresAt <= new Date()) {
      res.status(401).json({
        success: false,
        error: {
          code: "SESSION_EXPIRED",
          message: "Session has expired.",
        },
      });

      return;
    }

    req.user = session.user;
    req.session = session;

    next();
  } catch (error) {
    console.error("Authentication failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "AUTHENTICATION_FAILED",
        message: "Unable to authenticate request.",
      },
    });
  }
};
