export type DashboardOverview = {
  totalProjects: number;
  activeProjects: number;
  totalIssues: number;
  totalMembers: number;
};

export type DashboardIssueStatus = {
  TODO: number;
  IN_PROGRESS: number;
  IN_REVIEW: number;
  DONE: number;
};

export type DashboardIssuePriority = {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  URGENT: number;
};

export type DashboardIssues = {
  byStatus: DashboardIssueStatus;
  byPriority: DashboardIssuePriority;
};

export type DashboardActivity = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type DashboardData = {
  overview: DashboardOverview;
  issues: DashboardIssues;
  recentActivities: DashboardActivity[];
};

export type DashboardResponse = {
  success: boolean;
  data: DashboardData;
};