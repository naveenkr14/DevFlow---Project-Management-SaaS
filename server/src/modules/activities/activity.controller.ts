import type { Request, Response } from "express";

import { isValidUUID } from "../../lib/validation.js";

import {
  getEntityActivitiesService,
  getUserActivitiesService,
  getWorkspaceActivitiesService,
} from "./activity.service.js";

const validActions = [
  "ISSUE_CREATED",
  "ISSUE_UPDATED",
  "ISSUE_STATUS_CHANGED",
  "ISSUE_ASSIGNED",
  "ISSUE_PRIORITY_CHANGED",
  "COMMENT_CREATED",
  "COMMENT_UPDATED",
  "COMMENT_DELETED",
  "LABEL_CREATED",
  "LABEL_UPDATED",
  "LABEL_DELETED",
  "LABEL_ADDED_TO_ISSUE",
  "LABEL_REMOVED_FROM_ISSUE",
] as const;

const validEntityTypes = [
  "ISSUE",
  "COMMENT",
  "LABEL",
] as const;

export const getWorkspaceActivitiesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const workspaceId = req.params.workspaceId;

    if (typeof workspaceId !== "string" || !isValidUUID(workspaceId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_WORKSPACE_ID",
          message: "Invalid workspace ID.",
        },
      });

      return;
    }

    const rawLimit = req.query.limit;
    const rawCursor = req.query.cursor;
    const rawAction = req.query.action;
    const rawEntityType = req.query.entityType;

    let limit = 20;

    if (typeof rawLimit === "string") {
      const parsedLimit = Number(rawLimit);

      if (
        !Number.isInteger(parsedLimit) ||
        parsedLimit < 1 ||
        parsedLimit > 100
      ) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ACTIVITY_LIMIT",
            message: "Limit must be an integer between 1 and 100.",
          },
        });

        return;
      }

      limit = parsedLimit;
    }

    let cursor: string | undefined;

    if (typeof rawCursor === "string") {
      if (!isValidUUID(rawCursor)) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ACTIVITY_CURSOR",
            message: "Invalid activity cursor.",
          },
        });

        return;
      }

      cursor = rawCursor;
    }

    let action:
      | (typeof validActions)[number]
      | undefined;

    if (typeof rawAction === "string") {
      if (
        !validActions.includes(
          rawAction as (typeof validActions)[number],
        )
      ) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ACTIVITY_ACTION",
            message: "Invalid activity action.",
          },
        });

        return;
      }

      action = rawAction as (typeof validActions)[number];
    }

    let entityType:
      | (typeof validEntityTypes)[number]
      | undefined;

    if (typeof rawEntityType === "string") {
      if (
        !validEntityTypes.includes(
          rawEntityType as (typeof validEntityTypes)[number],
        )
      ) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ACTIVITY_ENTITY_TYPE",
            message: "Invalid activity entity type.",
          },
        });

        return;
      }

      entityType = rawEntityType as (typeof validEntityTypes)[number];
    }

    const result = await getWorkspaceActivitiesService(
      workspaceId,
      req.user.id,
      limit,
      cursor,
      action,
      entityType,
    );

    res.status(200).json({
      success: true,
      data: result.activities,
      pagination: result.pagination,
      filters: result.filters,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "WORKSPACE_ACCESS_DENIED"
    ) {
      res.status(403).json({
        success: false,
        error: {
          code: "WORKSPACE_ACCESS_DENIED",
          message: "You do not have access to this workspace.",
        },
      });

      return;
    }

    console.error("Workspace activities fetch failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "ACTIVITIES_FETCH_FAILED",
        message: "Unable to fetch workspace activities.",
      },
    });
  }
};

export const getEntityActivitiesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const entityType = req.params.entityType;
    const entityId = req.params.entityId;

    if (
      typeof entityType !== "string" ||
      !validEntityTypes.includes(
        entityType as (typeof validEntityTypes)[number],
      )
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ACTIVITY_ENTITY_TYPE",
          message: "Invalid activity entity type.",
        },
      });

      return;
    }

    if (typeof entityId !== "string" || !isValidUUID(entityId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ENTITY_ID",
          message: "Invalid entity ID.",
        },
      });

      return;
    }

    const activities = await getEntityActivitiesService(
      entityType as (typeof validEntityTypes)[number],
      entityId,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ENTITY_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "ENTITY_NOT_FOUND",
          message: "No activity found for this entity.",
        },
      });

      return;
    }

    if (
      error instanceof Error &&
      error.message === "WORKSPACE_ACCESS_DENIED"
    ) {
      res.status(403).json({
        success: false,
        error: {
          code: "WORKSPACE_ACCESS_DENIED",
          message: "You do not have access to this activity.",
        },
      });

      return;
    }

    console.error("Entity activities fetch failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "ENTITY_ACTIVITIES_FETCH_FAILED",
        message: "Unable to fetch entity activities.",
      },
    });
  }
};

export const getMyActivitiesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user.id;

    const activities = await getUserActivitiesService(userId);

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("User activities fetch failed:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "USER_ACTIVITIES_FETCH_FAILED",
        message: "Unable to fetch user activities.",
      },
    });
  }
};