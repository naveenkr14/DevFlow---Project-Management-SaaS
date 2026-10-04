import {
  createIssueWithNextNumber,
  findIssueById,
  findIssuesByProjectId,
  findProjectById,
  findUserById,
  findWorkspaceMembership,
  updateIssue,
  updateIssueStatus,
} from "./issue.repository.js";

import type {
  CreateIssueInput,
  UpdateIssueInput,
} from "./issue.schema.js";

import type {
  UpdateIssueStatusInput,
} from "./issue-status.schema.js";

import { createActivityService } from "../activities/activity.service.js";

type IssueRole =
  | "ADMIN"
  | "MANAGER"
  | "DEVELOPER"
  | "VIEWER";

const canCreateOrUpdateIssue = (
  role: IssueRole,
) => {
  return (
    role === "ADMIN" ||
    role === "MANAGER" ||
    role === "DEVELOPER"
  );
};

export const createIssueService = async (
  projectId: string,
  userId: string,
  data: CreateIssueInput,
) => {
  const project = await findProjectById(projectId);

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  if (project.status === "ARCHIVED") {
    throw new Error("PROJECT_ARCHIVED");
  }

  const membership = await findWorkspaceMembership(
    project.workspace.id,
    userId,
  );

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  const role = membership.role as IssueRole;

  if (!canCreateOrUpdateIssue(role)) {
    throw new Error("INSUFFICIENT_WORKSPACE_ROLE");
  }

  if (data.assigneeId) {
    const assignee = await findUserById(
      data.assigneeId,
    );

    if (!assignee) {
      throw new Error("ASSIGNEE_NOT_FOUND");
    }

    const assigneeMembership =
      await findWorkspaceMembership(
        project.workspace.id,
        data.assigneeId,
      );

    if (!assigneeMembership) {
      throw new Error(
        "ASSIGNEE_NOT_WORKSPACE_MEMBER",
      );
    }
  }

  const issue =
    await createIssueWithNextNumber({
      projectId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      reporterId: userId,
      assigneeId: data.assigneeId,
    });

  await createActivityService({
    workspaceId: project.workspace.id,
    userId,
    action: "ISSUE_CREATED",
    entityType: "ISSUE",
    entityId: issue.id,
    metadata: {
      issueNumber: issue.issueNumber,
      issueKey: `${issue.project.key}-${issue.issueNumber}`,
      title: issue.title,
      projectId: issue.projectId,
    },
  });

  return {
    ...issue,
    key: `${issue.project.key}-${issue.issueNumber}`,
  };
};

export const getProjectIssuesService = async (
  projectId: string,
  userId: string,
) => {
  const project = await findProjectById(projectId);

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  const membership = await findWorkspaceMembership(
    project.workspace.id,
    userId,
  );

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  const issues =
    await findIssuesByProjectId(projectId);

  return issues.map((issue) => ({
    ...issue,
    key: `${issue.project.key}-${issue.issueNumber}`,
  }));
};

export const getIssueService = async (
  issueId: string,
  userId: string,
) => {
  const issue = await findIssueById(issueId);

  if (!issue) {
    throw new Error("ISSUE_NOT_FOUND");
  }

  const membership =
    await findWorkspaceMembership(
      issue.project.workspaceId,
      userId,
    );

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  return {
    ...issue,
    key: `${issue.project.key}-${issue.issueNumber}`,
  };
};

export const updateIssueService = async (
  issueId: string,
  userId: string,
  data: UpdateIssueInput,
) => {
  const issue = await findIssueById(issueId);

  if (!issue) {
    throw new Error("ISSUE_NOT_FOUND");
  }

  const membership =
    await findWorkspaceMembership(
      issue.project.workspaceId,
      userId,
    );

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  const role = membership.role as IssueRole;

  if (!canCreateOrUpdateIssue(role)) {
    throw new Error(
      "INSUFFICIENT_WORKSPACE_ROLE",
    );
  }

  if (data.assigneeId) {
    const assignee = await findUserById(
      data.assigneeId,
    );

    if (!assignee) {
      throw new Error("ASSIGNEE_NOT_FOUND");
    }

    const assigneeMembership =
      await findWorkspaceMembership(
        issue.project.workspaceId,
        data.assigneeId,
      );

    if (!assigneeMembership) {
      throw new Error(
        "ASSIGNEE_NOT_WORKSPACE_MEMBER",
      );
    }
  }

  const changedFields: string[] = [];

  const oldValues: Record<string, string | null> =
    {};

  const newValues: Record<string, string | null> =
    {};

  if (
    data.title !== undefined &&
    data.title !== issue.title
  ) {
    changedFields.push("title");

    oldValues.title = issue.title;
    newValues.title = data.title;
  }

  if (
    data.description !== undefined &&
    data.description !== issue.description
  ) {
    changedFields.push("description");

    oldValues.description = issue.description;
    newValues.description = data.description;
  }

  const assigneeChanged =
    data.assigneeId !== undefined &&
    data.assigneeId !== issue.assigneeId;

  const priorityChanged =
    data.priority !== undefined &&
    data.priority !== issue.priority;

  const updatedIssue =
    await updateIssue(issueId, data);

  if (changedFields.length > 0) {
    await createActivityService({
      workspaceId: issue.project.workspaceId,
      userId,
      action: "ISSUE_UPDATED",
      entityType: "ISSUE",
      entityId: issue.id,
      metadata: {
        changedFields,
        oldValues,
        newValues,
      },
    });
  }

  if (assigneeChanged) {
    await createActivityService({
      workspaceId: issue.project.workspaceId,
      userId,
      action: "ISSUE_ASSIGNED",
      entityType: "ISSUE",
      entityId: issue.id,
      metadata: {
        oldAssigneeId: issue.assigneeId,
        newAssigneeId: updatedIssue.assigneeId,
      },
    });
  }

  if (priorityChanged) {
    await createActivityService({
      workspaceId: issue.project.workspaceId,
      userId,
      action: "ISSUE_PRIORITY_CHANGED",
      entityType: "ISSUE",
      entityId: issue.id,
      metadata: {
        oldPriority: issue.priority,
        newPriority: updatedIssue.priority,
      },
    });
  }

  return {
    ...updatedIssue,
    key: `${updatedIssue.project.key}-${updatedIssue.issueNumber}`,
  };
};

export const updateIssueStatusService = async (
  issueId: string,
  userId: string,
  data: UpdateIssueStatusInput,
) => {
  const issue = await findIssueById(issueId);

  if (!issue) {
    throw new Error("ISSUE_NOT_FOUND");
  }

  const membership =
    await findWorkspaceMembership(
      issue.project.workspaceId,
      userId,
    );

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  const role = membership.role as IssueRole;

  if (!canCreateOrUpdateIssue(role)) {
    throw new Error(
      "INSUFFICIENT_WORKSPACE_ROLE",
    );
  }

  const oldStatus = issue.status;

  const updatedIssue =
    await updateIssueStatus(
      issueId,
      data.status,
    );

  await createActivityService({
    workspaceId: issue.project.workspaceId,
    userId,
    action: "ISSUE_STATUS_CHANGED",
    entityType: "ISSUE",
    entityId: issue.id,
    metadata: {
      oldStatus,
      newStatus: updatedIssue.status,
    },
  });

  return {
    ...updatedIssue,
    key: `${updatedIssue.project.key}-${updatedIssue.issueNumber}`,
  };
};