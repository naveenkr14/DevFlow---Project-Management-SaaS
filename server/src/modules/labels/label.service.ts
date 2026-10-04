import {
  createLabel,
  deleteLabel,
  findLabelById,
  findLabelByProjectAndName,
  findLabelsByProjectId,
  findProjectById,
  findWorkspaceMembership,
  updateLabel,
} from "./label.repository.js";

import type {
  CreateLabelInput,
  UpdateLabelInput,
} from "./label.schema.js";

import { createActivityService } from "../activities/activity.service.js";

type LabelRole =
  | "ADMIN"
  | "MANAGER"
  | "DEVELOPER"
  | "VIEWER";

const canManageLabels = (role: LabelRole) => {
  return (
    role === "ADMIN" ||
    role === "MANAGER"
  );
};

export const createLabelService = async (
  projectId: string,
  userId: string,
  data: CreateLabelInput,
) => {
  const project = await findProjectById(projectId);

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  if (project.status === "ARCHIVED") {
    throw new Error("PROJECT_ARCHIVED");
  }

  const membership = await findWorkspaceMembership(
    project.workspaceId,
    userId,
  );

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  const role = membership.role as LabelRole;

  if (!canManageLabels(role)) {
    throw new Error("INSUFFICIENT_WORKSPACE_ROLE");
  }

  const existingLabel =
    await findLabelByProjectAndName(
      projectId,
      data.name,
    );

  if (existingLabel) {
    throw new Error("LABEL_ALREADY_EXISTS");
  }

  const label = await createLabel({
    projectId,
    name: data.name,
    color: data.color,
  });

  await createActivityService({
    workspaceId: project.workspaceId,
    userId,
    action: "LABEL_CREATED",
    entityType: "LABEL",
    entityId: label.id,
    metadata: {
      projectId: label.projectId,
      name: label.name,
      color: label.color,
    },
  });

  return label;
};

export const getProjectLabelsService = async (
  projectId: string,
  userId: string,
) => {
  const project = await findProjectById(projectId);

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  const membership = await findWorkspaceMembership(
    project.workspaceId,
    userId,
  );

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  return findLabelsByProjectId(projectId);
};

export const updateLabelService = async (
  labelId: string,
  userId: string,
  data: UpdateLabelInput,
) => {
  const label = await findLabelById(labelId);

  if (!label) {
    throw new Error("LABEL_NOT_FOUND");
  }

  const membership = await findWorkspaceMembership(
    label.project.workspaceId,
    userId,
  );

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  const role = membership.role as LabelRole;

  if (!canManageLabels(role)) {
    throw new Error("INSUFFICIENT_WORKSPACE_ROLE");
  }

  if (data.name) {
    const existingLabel =
      await findLabelByProjectAndName(
        label.project.id,
        data.name,
      );

    if (
      existingLabel &&
      existingLabel.id !== labelId
    ) {
      throw new Error("LABEL_ALREADY_EXISTS");
    }
  }

  const changedFields: string[] = [];

  const oldValues: Record<string, string> = {};

  const newValues: Record<string, string> = {};

  if (
    data.name !== undefined &&
    data.name !== label.name
  ) {
    changedFields.push("name");

    oldValues.name = label.name;
    newValues.name = data.name;
  }

  if (
    data.color !== undefined &&
    data.color !== label.color
  ) {
    changedFields.push("color");

    oldValues.color = label.color;
    newValues.color = data.color;
  }

  const updatedLabel = await updateLabel(
    labelId,
    data,
  );

  if (changedFields.length > 0) {
    await createActivityService({
      workspaceId: label.project.workspaceId,
      userId,
      action: "LABEL_UPDATED",
      entityType: "LABEL",
      entityId: label.id,
      metadata: {
        changedFields,
        oldValues,
        newValues,
      },
    });
  }

  return updatedLabel;
};

export const deleteLabelService = async (
  labelId: string,
  userId: string,
) => {
  const label = await findLabelById(labelId);

  if (!label) {
    throw new Error("LABEL_NOT_FOUND");
  }

  const membership = await findWorkspaceMembership(
    label.project.workspaceId,
    userId,
  );

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  const role = membership.role as LabelRole;

  if (!canManageLabels(role)) {
    throw new Error("INSUFFICIENT_WORKSPACE_ROLE");
  }

  await deleteLabel(labelId);

  await createActivityService({
    workspaceId: label.project.workspaceId,
    userId,
    action: "LABEL_DELETED",
    entityType: "LABEL",
    entityId: label.id,
    metadata: {
      projectId: label.project.id,
      name: label.name,
      color: label.color,
    },
  });

  return {
    id: labelId,
  };
};