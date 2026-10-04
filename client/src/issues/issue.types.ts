export type IssueStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE";

export type IssuePriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export type IssueUser = {
  id: string;
  name: string;
  email: string;
};

export type IssueProject = {
  id: string;
  name: string;
  key: string;
  workspaceId: string;
};

export type Issue = {
  id: string;
  projectId: string;
  issueNumber: number;
  key: string;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  reporterId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  project: IssueProject;
  reporter: IssueUser;
  assignee: IssueUser | null;
};

export type IssuesResponse = {
  success: boolean;
  data: Issue[];
};

export type IssueResponse = {
  success: boolean;
  data: Issue;
};

export type CreateIssueInput = {
  title: string;
  description?: string;
  priority?: IssuePriority;
  assigneeId?: string;
};

export type UpdateIssueInput = {
  title?: string;
  description?: string;
  priority?: IssuePriority;
  assigneeId?: string | null;
};

export type UpdateIssueStatusInput = {
  status: IssueStatus;
};