import { prisma } from "../../lib/prisma.js";

export const findProjectById = async (projectId: string) => {
  return prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      id: true,
      name: true,
      key: true,
      workspaceId: true,
      status: true,
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

export const findLabelById = async (labelId: string) => {
  return prisma.label.findUnique({
    where: {
      id: labelId,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          key: true,
          workspaceId: true,
        },
      },
    },
  });
};

export const findLabelByProjectAndName = async (
  projectId: string,
  name: string,
) => {
  return prisma.label.findUnique({
    where: {
      projectId_name: {
        projectId,
        name,
      },
    },
  });
};

export const createLabel = async (data: {
  projectId: string;
  name: string;
  color: string;
}) => {
  return prisma.label.create({
    data: {
      projectId: data.projectId,
      name: data.name,
      color: data.color,
    },
  });
};

export const findLabelsByProjectId = async (
  projectId: string,
) => {
  return prisma.label.findMany({
    where: {
      projectId,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const updateLabel = async (
  labelId: string,
  data: {
    name?: string;
    color?: string;
  },
) => {
  return prisma.label.update({
    where: {
      id: labelId,
    },
    data,
  });
};

export const deleteLabel = async (
  labelId: string,
) => {
  return prisma.label.delete({
    where: {
      id: labelId,
    },
  });
};