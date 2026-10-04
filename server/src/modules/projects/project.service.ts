import {
  createProject,
  findProjectById,
  findProjectByIdWithWorkspace,
  findProjectByKey,
  findProjectsByWorkspaceId,
  updateProject,
} from "./project.repository.js";

import type {
  CreateProjectInput,
  UpdateProjectInput,
} from "./project.schema.js";

import {
  findWorkspaceById,
  findWorkspaceMembership,
} from "../workspaces/workspace.repository.js";

export const createProjectService = async (
  workspaceId: string,
  userId: string,
  data: CreateProjectInput,
) => {
  const workspace =
    await findWorkspaceById(workspaceId);

  if (!workspace) {
    throw new Error("WORKSPACE_NOT_FOUND");
  }

  const membership =
    await findWorkspaceMembership(
      workspaceId,
      userId,
    );

  if (!membership) {
    throw new Error(
      "WORKSPACE_ACCESS_DENIED",
    );
  }

  if (
    membership.role !== "ADMIN" &&
    membership.role !== "MANAGER"
  ) {
    throw new Error(
      "INSUFFICIENT_WORKSPACE_ROLE",
    );
  }

  const existingProject =
    await findProjectByKey(
      workspaceId,
      data.key,
    );

  if (existingProject) {
    throw new Error(
      "PROJECT_KEY_ALREADY_EXISTS",
    );
  }

  return createProject({
    workspaceId,
    name: data.name,
    key: data.key,
    description: data.description,
  });
};

export const getWorkspaceProjectsService =
  async (
    workspaceId: string,
    userId: string,
  ) => {
    const workspace =
      await findWorkspaceById(workspaceId);

    if (!workspace) {
      throw new Error(
        "WORKSPACE_NOT_FOUND",
      );
    }

    const membership =
      await findWorkspaceMembership(
        workspaceId,
        userId,
      );

    if (!membership) {
      throw new Error(
        "WORKSPACE_ACCESS_DENIED",
      );
    }

    return findProjectsByWorkspaceId(
      workspaceId,
    );
  };

export const getProjectService = async (
  projectId: string,
  userId: string,
) => {
  const project =
    await findProjectByIdWithWorkspace(
      projectId,
    );

  if (!project) {
    throw new Error(
      "PROJECT_NOT_FOUND",
    );
  }

  const membership =
    await findWorkspaceMembership(
      project.workspace.id,
      userId,
    );

  if (!membership) {
    throw new Error(
      "WORKSPACE_ACCESS_DENIED",
    );
  }

  return project;
};

export const updateProjectService = async (
  projectId: string,
  userId: string,
  data: UpdateProjectInput,
) => {
  const project =
    await findProjectById(projectId);

  if (!project) {
    throw new Error(
      "PROJECT_NOT_FOUND",
    );
  }

  const membership =
    await findWorkspaceMembership(
      project.workspaceId,
      userId,
    );

  if (!membership) {
    throw new Error(
      "WORKSPACE_ACCESS_DENIED",
    );
  }

  if (
    membership.role !== "ADMIN" &&
    membership.role !== "MANAGER"
  ) {
    throw new Error(
      "INSUFFICIENT_WORKSPACE_ROLE",
    );
  }

  return updateProject(
    projectId,
    data,
  );
};