import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "@prisma/client";

export const createActivity = async (data: {
  workspaceId: string;
  userId: string;
  action:
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
  entityType: "ISSUE" | "COMMENT" | "LABEL";
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}) => {
  return prisma.activity.create({
    data: {
      workspaceId: data.workspaceId,
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      metadata: data.metadata,
    },
  });
};

export const findActivitiesByEntity = async (
  entityType: "ISSUE" | "COMMENT" | "LABEL",
  entityId: string,
) => {
  return prisma.activity.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const findActivitiesByUser = async (
  userId: string,
) => {
  return prisma.activity.findMany({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const findActivitiesByWorkspaceId = async (
  workspaceId: string,
  limit: number,
  cursor?: string,
  action?: Prisma.ActivityWhereInput["action"],
  entityType?: Prisma.ActivityWhereInput["entityType"],
) => {
  return prisma.activity.findMany({
    where: {
      workspaceId,
      ...(action ? { action } : {}),
      ...(entityType ? { entityType } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
    take: limit + 1,
    ...(cursor
      ? {
          cursor: {
            id: cursor,
          },
          skip: 1,
        }
      : {}),
  });
};

export const findWorkspaceMembership = async (
  workspaceId: string,
  userId: string,
) => {
  return prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });
};