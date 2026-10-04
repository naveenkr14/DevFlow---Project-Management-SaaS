import { prisma } from "../../lib/prisma.js";

export const findIssueById = async (
  issueId: string,
) => {
  return prisma.issue.findUnique({
    where: {
      id: issueId,
    },
    select: {
      id: true,
      projectId: true,
      project: {
        select: {
          id: true,
          workspaceId: true,
          name: true,
          key: true,
        },
      },
    },
  });
};

export const findLabelById = async (
  labelId: string,
) => {
  return prisma.label.findUnique({
    where: {
      id: labelId,
    },
    select: {
      id: true,
      projectId: true,
      name: true,
      color: true,
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

export const findIssueLabel = async (
  issueId: string,
  labelId: string,
) => {
  return prisma.issueLabel.findUnique({
    where: {
      issueId_labelId: {
        issueId,
        labelId,
      },
    },
  });
};

export const createIssueLabel = async (
  issueId: string,
  labelId: string,
) => {
  return prisma.issueLabel.create({
    data: {
      issueId,
      labelId,
    },
    include: {
      label: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });
};

export const findLabelsByIssueId = async (
  issueId: string,
) => {
  return prisma.issueLabel.findMany({
    where: {
      issueId,
    },
    include: {
      label: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
    orderBy: {
      label: {
        name: "asc",
      },
    },
  });
};

export const deleteIssueLabel = async (
  issueId: string,
  labelId: string,
) => {
  return prisma.issueLabel.delete({
    where: {
      issueId_labelId: {
        issueId,
        labelId,
      },
    },
  });
};