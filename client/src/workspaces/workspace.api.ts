import { apiRequest } from "../lib/api";

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceMembership = {
  id: string;
  role:
    | "ADMIN"
    | "MANAGER"
    | "DEVELOPER"
    | "VIEWER";
};

export type WorkspaceMember = {
  id: string;
  userId: string;
  role:
    | "ADMIN"
    | "MANAGER"
    | "DEVELOPER"
    | "VIEWER";
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type CreateWorkspaceResponse = {
  success: boolean;
  message: string;
  data: {
    workspace: Workspace;
    membership: WorkspaceMembership;
  };
};

type GetWorkspaceResponse = {
  success: boolean;
  data: Workspace;
};

type GetWorkspaceMembersResponse = {
  success: boolean;
  data: WorkspaceMember[];
};

export type CreateWorkspaceInput = {
  name: string;
  slug: string;
};

export const createWorkspace = async (
  input: CreateWorkspaceInput,
) => {
  const response =
    await apiRequest<CreateWorkspaceResponse>(
      "/workspaces",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );

  return response.data;
};

export const getWorkspace = async (
  workspaceId: string,
) => {
  const response =
    await apiRequest<GetWorkspaceResponse>(
      `/workspaces/${workspaceId}`,
    );

  return response.data;
};

export const getWorkspaceBySlug = async (
  workspaceSlug: string,
) => {
  const response =
    await apiRequest<GetWorkspaceResponse>(
      `/workspaces/slug/${encodeURIComponent(workspaceSlug)}`,
    );

  return response.data;
};

export const getWorkspaceMembers = async (
  workspaceId: string,
) => {
  const response =
    await apiRequest<GetWorkspaceMembersResponse>(
      `/workspaces/${workspaceId}/members`,
    );

  return response.data;
};
