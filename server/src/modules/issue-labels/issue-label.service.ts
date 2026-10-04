import {
  createIssueLabel,
  deleteIssueLabel,
  findIssueById,
  findIssueLabel,
  findLabelById,
  findLabelsByIssueId,
  findWorkspaceMembership,
} from "./issue-label.repository.js";

import { createActivityService } from "../activities/activity.service.js";

export const addLabelToIssueService = async (
  issueId: string,
  labelId: string,
  userId: string,
) => {
  const issue = await findIssueById(issueId);

  if (!issue) {
    throw new Error("ISSUE_NOT_FOUND");
  }

  const membership = await findWorkspaceMembership(
    issue.project.workspaceId,
    userId,
  );

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  const label = await findLabelById(labelId);

  if (!label) {
    throw new Error("LABEL_NOT_FOUND");
  }

  if (label.projectId !== issue.projectId) {
    throw new Error("LABEL_PROJECT_MISMATCH");
  }

  const existingIssueLabel =
    await findIssueLabel(issueId, labelId);

  if (existingIssueLabel) {
    throw new Error("LABEL_ALREADY_ATTACHED");
  }

  const issueLabel = await createIssueLabel(
    issueId,
    labelId,
  );

  await createActivityService({
    workspaceId: issue.project.workspaceId,
    userId,
    action: "LABEL_ADDED_TO_ISSUE",
    entityType: "LABEL",
    entityId: label.id,
    metadata: {
      issueId,
      labelId: label.id,
      labelName: label.name,
      labelColor: label.color,
    },
  });

  return issueLabel;
};

export const getIssueLabelsService = async (
  issueId: string,
  userId: string,
) => {
  const issue = await findIssueById(issueId);

  if (!issue) {
    throw new Error("ISSUE_NOT_FOUND");
  }

  const membership = await findWorkspaceMembership(
    issue.project.workspaceId,
    userId,
  );

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  const issueLabels =
    await findLabelsByIssueId(issueId);

  return issueLabels.map(
    (issueLabel) => issueLabel.label,
  );
};

export const removeLabelFromIssueService = async (
  issueId: string,
  labelId: string,
  userId: string,
) => {
  const issue = await findIssueById(issueId);

  if (!issue) {
    throw new Error("ISSUE_NOT_FOUND");
  }

  const membership = await findWorkspaceMembership(
    issue.project.workspaceId,
    userId,
  );

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  const label = await findLabelById(labelId);

  if (!label) {
    throw new Error("LABEL_NOT_FOUND");
  }

  if (label.projectId !== issue.projectId) {
    throw new Error("LABEL_PROJECT_MISMATCH");
  }

  const existingIssueLabel =
    await findIssueLabel(issueId, labelId);

  if (!existingIssueLabel) {
    throw new Error("LABEL_NOT_ATTACHED");
  }

  await deleteIssueLabel(issueId, labelId);

  await createActivityService({
    workspaceId: issue.project.workspaceId,
    userId,
    action: "LABEL_REMOVED_FROM_ISSUE",
    entityType: "LABEL",
    entityId: label.id,
    metadata: {
      issueId,
      labelId: label.id,
      labelName: label.name,
      labelColor: label.color,
    },
  });

  return {
    issueId,
    labelId,
  };
};