export type SearchProjectStatus =
  | "ACTIVE"
  | "ARCHIVED";

export type SearchIssueStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE";

export type SearchIssuePriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export type SearchProject = {
  id: string;
  name: string;
  key: string;
  description: string | null;
  status: SearchProjectStatus;
  workspaceId: string;
};

export type SearchIssueProject = {
  id: string;
  name: string;
  key: string;
};

export type SearchIssue = {
  id: string;
  issueNumber: number;
  title: string;
  description: string | null;
  status: SearchIssueStatus;
  priority: SearchIssuePriority;
  project: SearchIssueProject;
};

export type SearchResults = {
  projects: SearchProject[];
  issues: SearchIssue[];
};

export type SearchCounts = {
  projects: number;
  issues: number;
  total: number;
};

export type SearchResponse = {
  success: boolean;
  data: {
    query: string;
    results: SearchResults;
    counts: SearchCounts;
  };
};