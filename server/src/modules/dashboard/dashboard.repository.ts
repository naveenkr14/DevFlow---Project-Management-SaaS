import { prisma } from "../../lib/prisma.js";

export const countWorkspaceProjects = async (
  workspaceId: string,
) => {
  return prisma.project.count({
    where: {
      workspaceId,
    },
  });
};

export const countActiveWorkspaceProjects = async (
  workspaceId: string,
) => {
  return prisma.project.count({
    where: {
      workspaceId,
      status: "ACTIVE",
    },
  });
};

export const countWorkspaceIssues = async (
  workspaceId: string,
) => {
  return prisma.issue.count({
    where: {
      project: {
        workspaceId,
      },
    },
  });
};

export const countWorkspaceMembers = async (
  workspaceId: string,
) => {
  return prisma.workspaceMember.count({
    where: {
      workspaceId,
    },
  });
};

export const getWorkspaceIssuesByStatus = async (
  workspaceId: string,
) => {
  return prisma.issue.groupBy({
    by: ["status"],
    where: {
      project: {
        workspaceId,
      },
    },
    _count: {
      _all: true,
    },
  });
};

export const getWorkspaceIssuesByPriority = async (
  workspaceId: string,
) => {
  return prisma.issue.groupBy({
    by: ["priority"],
    where: {
      project: {
        workspaceId,
      },
    },
    _count: {
      _all: true,
    },
  });
};

export const findRecentWorkspaceActivities = async (
  workspaceId: string,
) => {
  return prisma.activity.findMany({
    where: {
      workspaceId,
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
    take: 10,
  });
};