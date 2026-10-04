import type { Request, Response } from "express";
import { checkDatabaseConnection } from "./health.service.js";

export const getHealth = (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "DevFlow API is running",
  });
};

export const getDatabaseHealth = async (_req: Request, res: Response) => {
  try {
    const result = await checkDatabaseConnection();

    res.status(200).json({
      success: true,
      message: "Database connection is working",
      data: result,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(503).json({
      success: false,
      message: "Database connection failed",
    });
  }
};
