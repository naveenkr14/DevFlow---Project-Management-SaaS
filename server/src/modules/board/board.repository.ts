import { prisma } from "../../lib/prisma.js";

export const findProjectById = async (
  projectId: string,
) => {
  return prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      id: true,
      name: true,
      key: true,
      description: true,
      status: true,
      workspaceId: true,
    },
  });
};

export const findBoardIssuesByProjectId = async (
  projectId: string,
) => {
  return prisma.issue.findMany({
    where: {
      projectId,
    },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      labels: {
        include: {
          label: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
    },
    orderBy: {
      issueNumber: "desc",
    },
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