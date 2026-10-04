import {
  countActiveWorkspaceProjects,
  countWorkspaceIssues,
  countWorkspaceMembers,
  countWorkspaceProjects,
  findRecentWorkspaceActivities,
  getWorkspaceIssuesByPriority,
  getWorkspaceIssuesByStatus,
} from "./dashboard.repository.js";

import { findWorkspaceMembership } from "../activities/activity.repository.js";

export const getWorkspaceDashboardService = async (
  workspaceId: string,
  userId: string,
) => {
  const membership = await findWorkspaceMembership(
    workspaceId,
    userId,
  );

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  const [
    totalProjects,
    activeProjects,
    totalIssues,
    totalMembers,
    issuesByStatus,
    issuesByPriority,
    recentActivities,
  ] = await Promise.all([
    countWorkspaceProjects(workspaceId),
    countActiveWorkspaceProjects(workspaceId),
    countWorkspaceIssues(workspaceId),
    countWorkspaceMembers(workspaceId),
    getWorkspaceIssuesByStatus(workspaceId),
    getWorkspaceIssuesByPriority(workspaceId),
    findRecentWorkspaceActivities(workspaceId),
  ]);

  const statusCounts = {
    TODO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0,
  };

  for (const item of issuesByStatus) {
    statusCounts[item.status] = item._count._all;
  }

  const priorityCounts = {
    EASY: 0,
    LOW: 0,
    MEDIUM: 0,
    HARD: 0,
    HIGH: 0,
    URGENT: 0,
  };

  for (const item of issuesByPriority) {
    priorityCounts[item.priority] =
      item._count._all;
  }

  return {
    overview: {
      totalProjects,
      activeProjects,
      totalIssues,
      totalMembers,
    },

    issues: {
      byStatus: statusCounts,
      byPriority: priorityCounts,
    },

    recentActivities,
  };
};
