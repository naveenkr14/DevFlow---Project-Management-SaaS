import { prisma } from "../../lib/prisma.js";

export const createProject = async (data: {
  workspaceId: string;
  name: string;
  key: string;
  description?: string;
}) => {
  return prisma.project.create({
    data: {
      workspaceId: data.workspaceId,
      name: data.name,
      key: data.key,
      description: data.description,
    },
  });
};

export const findProjectsByWorkspaceId = async (workspaceId: string) => {
  return prisma.project.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const findProjectById = async (projectId: string) => {
  return prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });
};

export const findProjectByIdWithWorkspace = async (projectId: string) => {
  return prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
};

export const findProjectByKey = async (workspaceId: string, key: string) => {
  return prisma.project.findUnique({
    where: {
      workspaceId_key: {
        workspaceId,
        key,
      },
    },
  });
};

export const updateProject = async (
  projectId: string,
  data: {
    name?: string;
    description?: string;
    status?: "ACTIVE" | "ARCHIVED";
  },
) => {
  return prisma.project.update({
    where: {
      id: projectId,
    },
    data,
  });
};
