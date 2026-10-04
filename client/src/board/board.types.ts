export type BoardIssueStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE";

export type BoardIssuePriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export type BoardIssue = {
  id: string;
  projectId: string;
  issueNumber: number;
  title: string;
  description: string | null;
  status: BoardIssueStatus;
  priority: BoardIssuePriority;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BoardColumn = {
  status: BoardIssueStatus;
  issues: BoardIssue[];
};

export type ProjectBoard = {
  projectId: string;
  columns: BoardColumn[];
};

export type ProjectBoardResponse = {
  success: boolean;
  data: ProjectBoard;
};