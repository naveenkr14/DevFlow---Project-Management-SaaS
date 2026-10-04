import { apiRequest } from "../lib/api";

import type {
  CreateProjectInput,
  CreateProjectResponse,
  ProjectDetailsResponse,
  ProjectsResponse,
} from "./project.types";

export const getWorkspaceProjects = async (
  workspaceId: string,
) => {
  const response =
    await apiRequest<ProjectsResponse>(
      `/workspaces/${workspaceId}/projects`,
    );

  return response.data;
};

export const createProject = async (
  workspaceId: string,
  input: CreateProjectInput,
) => {
  const response =
    await apiRequest<CreateProjectResponse>(
      `/workspaces/${workspaceId}/projects`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );

  return response.data;
};

export const getProject = async (
  projectId: string,
) => {
  const response =
    await apiRequest<ProjectDetailsResponse>(
      `/projects/${projectId}`,
    );

  return response.data;
};