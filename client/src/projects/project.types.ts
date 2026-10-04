export type ProjectStatus =
  | "ACTIVE"
  | "ARCHIVED";

export type ProjectWorkspace = {
  id: string;
  name: string;
  slug: string;
};

export type Project = {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  description: string | null;
  status: ProjectStatus;
  issueCounter: number;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDetails = Project & {
  workspace: ProjectWorkspace;
};

export type ProjectsResponse = {
  success: boolean;
  data: Project[];
};

export type ProjectDetailsResponse = {
  success: boolean;
  data: ProjectDetails;
};

export type CreateProjectInput = {
  name: string;
  key: string;
  description?: string;
};

export type CreateProjectResponse = {
  success: boolean;
  message: string;
  data: Project;
};