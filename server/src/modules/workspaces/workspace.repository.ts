import { prisma } from "../../lib/prisma.js";

export const createWorkspaceWithOwner = async (data: {
  name: string;
  slug: string;
  ownerId: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: data.name,
        slug: data.slug,
        ownerId: data.ownerId,
      },
    });

    const membership = await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: data.ownerId,
        role: "ADMIN",
      },
    });

    return {
      workspace,
      membership,
    };
  });
};

export const findWorkspaceBySlug = async (
  slug: string,
) => {
  return prisma.workspace.findUnique({
    where: {
      slug,
    },
  });
};

export const findWorkspaceById = async (
  workspaceId: string,
) => {
  return prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });
};

export const findWorkspaceMembers = async (
  workspaceId: string,
) => {
  return prisma.workspaceMember.findMany({
    where: {
      workspaceId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const findUserByEmail = async (
  email: string,
) => {
  return prisma.user.findUnique({
    where: {
      email,
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

export const countWorkspaceAdmins = async (
  workspaceId: string,
) => {
  return prisma.workspaceMember.count({
    where: {
      workspaceId,
      role: "ADMIN",
    },
  });
};

export const createWorkspaceMember = async (data: {
  workspaceId: string;
  userId: string;
  role:
    | "ADMIN"
    | "MANAGER"
    | "DEVELOPER"
    | "VIEWER";
}) => {
  return prisma.workspaceMember.create({
    data,
  });
};

export const updateWorkspaceMemberRole = async (
  workspaceId: string,
  userId: string,
  role:
    | "ADMIN"
    | "MANAGER"
    | "DEVELOPER"
    | "VIEWER",
) => {
  return prisma.workspaceMember.update({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    data: {
      role,
    },
  });
};

export const deleteWorkspaceMember = async (
  workspaceId: string,
  userId: string,
) => {
  return prisma.workspaceMember.delete({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });
};