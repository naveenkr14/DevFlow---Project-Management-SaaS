import { prisma } from "../../lib/prisma.js";

export const findProjectById = async (
  projectId: string,
) => {
  return prisma.project.findUnique({
    where: { id: projectId },
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

export const findIssueById = async (
  issueId: string,
) => {
  return prisma.issue.findUnique({
    where: { id: issueId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          key: true,
          workspaceId: true,
        },
      },
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
    },
  });
};

export const findIssuesByProjectId = async (
  projectId: string,
) => {
  return prisma.issue.findMany({
    where: { projectId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          key: true,
          workspaceId: true,
        },
      },
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
    },
    orderBy: {
      issueNumber: "desc",
    },
  });
};

export const findUserById = async (
  userId: string,
) => {
  return prisma.user.findUnique({
    where: { id: userId },
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

export const createIssueWithNextNumber = async (
  data: {
    projectId: string;
    title: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    reporterId: string;
    assigneeId?: string;
  },
) => {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.update({
      where: {
        id: data.projectId,
      },
      data: {
        issueCounter: {
          increment: 1,
        },
      },
      select: {
        id: true,
        key: true,
        issueCounter: true,
      },
    });

    const issue = await tx.issue.create({
      data: {
        projectId: data.projectId,
        issueNumber: project.issueCounter,
        title: data.title,
        description: data.description,
        priority: data.priority,
        reporterId: data.reporterId,
        assigneeId: data.assigneeId,
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
      },
    });

    return issue;
  });
};

export const updateIssue = async (
  issueId: string,
  data: {
    title?: string;
    description?: string;
    status?:
      | "TODO"
      | "IN_PROGRESS"
      | "IN_REVIEW"
      | "DONE";
    priority?:
      | "LOW"
      | "MEDIUM"
      | "HIGH"
      | "URGENT";
    assigneeId?: string | null;
  },
) => {
  return prisma.issue.update({
    where: { id: issueId },
    data,
    include: {
      project: {
        select: {
          id: true,
          name: true,
          key: true,
          workspaceId: true,
        },
      },
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
    },
  });
};

export const updateIssueStatus = async (
  issueId: string,
  status:
    | "TODO"
    | "IN_PROGRESS"
    | "IN_REVIEW"
    | "DONE",
) => {
  return prisma.issue.update({
    where: {
      id: issueId,
    },
    data: {
      status,
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
    },
  });
};