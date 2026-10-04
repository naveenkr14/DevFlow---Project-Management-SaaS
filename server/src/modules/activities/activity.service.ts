import type { Prisma } from "@prisma/client";

import {
  createActivity,
  findActivitiesByEntity,
  findActivitiesByUser,
  findActivitiesByWorkspaceId,
  findWorkspaceMembership,
} from "./activity.repository.js";

type ActivityAction =
  | "ISSUE_CREATED"
  | "ISSUE_UPDATED"
  | "ISSUE_STATUS_CHANGED"
  | "ISSUE_ASSIGNED"
  | "ISSUE_PRIORITY_CHANGED"
  | "COMMENT_CREATED"
  | "COMMENT_UPDATED"
  | "COMMENT_DELETED"
  | "LABEL_CREATED"
  | "LABEL_UPDATED"
  | "LABEL_DELETED"
  | "LABEL_ADDED_TO_ISSUE"
  | "LABEL_REMOVED_FROM_ISSUE";

type ActivityEntityType =
  | "ISSUE"
  | "COMMENT"
  | "LABEL";

export const createActivityService = async (data: {
  workspaceId: string;
  userId: string;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}) => {
  return createActivity(data);
};

export const getEntityActivitiesService = async (
  entityType: ActivityEntityType,
  entityId: string,
  userId: string,
) => {
  const activities =
    await findActivitiesByEntity(
      entityType,
      entityId,
    );

  if (activities.length === 0) {
    throw new Error("ENTITY_NOT_FOUND");
  }

  const workspaceId =
    activities[0].workspaceId;

  const membership =
    await findWorkspaceMembership(
      workspaceId,
      userId,
    );

  if (!membership) {
    throw new Error(
      "WORKSPACE_ACCESS_DENIED",
    );
  }

  return activities;
};

export const getUserActivitiesService = async (
  userId: string,
) => {
  return findActivitiesByUser(userId);
};

export const getWorkspaceActivitiesService =
  async (
    workspaceId: string,
    userId: string,
    limit: number,
    cursor?: string,
    action?: ActivityAction,
    entityType?: ActivityEntityType,
  ) => {
    const membership =
      await findWorkspaceMembership(
        workspaceId,
        userId,
      );

    if (!membership) {
      throw new Error(
        "WORKSPACE_ACCESS_DENIED",
      );
    }

    const activities =
      await findActivitiesByWorkspaceId(
        workspaceId,
        limit,
        cursor,
        action,
        entityType,
      );

    const hasNextPage =
      activities.length > limit;

    const page = hasNextPage
      ? activities.slice(0, limit)
      : activities;

    const nextCursor = hasNextPage
      ? page[page.length - 1]?.id ?? null
      : null;

    return {
      activities: page,
      pagination: {
        limit,
        hasNextPage,
        nextCursor,
      },
      filters: {
        action: action ?? null,
        entityType: entityType ?? null,
      },
    };
  };