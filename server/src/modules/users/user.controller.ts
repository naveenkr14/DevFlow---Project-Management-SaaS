import type { Request, Response } from "express";
import { getUsers } from "./user.service.js";

export const getUsersController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const users = await getUsers();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "USERS_FETCH_FAILED",
        message: "Failed to fetch users.",
      },
    });
  }
};