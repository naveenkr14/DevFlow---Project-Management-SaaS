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

export const createComment = async (
  data: {
    issueId: string;
    authorId: string;
    content: string;
  },
) => {
  return prisma.comment.create({
    data: {
      issueId: data.issueId,
      authorId: data.authorId,
      content: data.content,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const findCommentsByIssueId = async (
  issueId: string,
) => {
  return prisma.comment.findMany({
    where: {
      issueId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const findCommentById = async (
  commentId: string,
) => {
  return prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      issue: {
        select: {
          id: true,
          projectId: true,
          project: {
            select: {
              id: true,
              workspaceId: true,
            },
          },
        },
      },
    },
  });
};

export const updateComment = async (
  commentId: string,
  content: string,
) => {
  return prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      content,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const deleteComment = async (
  commentId: string,
) => {
  return prisma.comment.delete({
    where: {
      id: commentId,
    },
  });
};