import type { Request, Response } from "express";
import { loginUser, logoutUser, registerUser } from "./auth.service.js";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_ALREADY_EXISTS") {
      res.status(409).json({
        success: false,
        error: {
          code: "USER_ALREADY_EXISTS",
          message: "A user with this email already exists.",
        },
      });

      return;
    }

    console.error("Registration failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "REGISTRATION_FAILED",
        message: "Unable to register user.",
      },
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginUser(req.body);

    res.cookie("devflow_session", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        expiresAt: result.expiresAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        },
      });

      return;
    }

    console.error("Login failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "LOGIN_FAILED",
        message: "Unable to login.",
      },
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    await logoutUser(req.session.id);

    res.clearCookie("devflow_session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "LOGOUT_FAILED",
        message: "Unable to logout.",
      },
    });
  }
};
