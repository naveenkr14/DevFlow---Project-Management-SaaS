import { prisma } from "../../lib/prisma.js";

export const findWorkspaceProjects = async (
  workspaceId: string,
  query: string,
) => {
  return prisma.project.findMany({
    where: {
      workspaceId,
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          key: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      key: true,
      description: true,
      status: true,
      workspaceId: true,
    },
    orderBy: {
      name: "asc",
    },
    take: 20,
  });
};

export const findWorkspaceIssues = async (
  workspaceId: string,
  query: string,
) => {
  return prisma.issue.findMany({
    where: {
      project: {
        workspaceId,
      },
      OR: [
        {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      id: true,
      issueNumber: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      project: {
        select: {
          id: true,
          name: true,
          key: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 20,
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