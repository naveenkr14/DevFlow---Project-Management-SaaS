import {
  findWorkspaceIssues,
  findWorkspaceMembership,
  findWorkspaceProjects,
} from "./search.repository.js";

export const searchWorkspaceService = async (
  workspaceId: string,
  userId: string,
  query: string,
) => {
  const membership = await findWorkspaceMembership(
    workspaceId,
    userId,
  );

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  const normalizedQuery = query.trim();

  if (normalizedQuery.length === 0) {
    throw new Error("EMPTY_SEARCH_QUERY");
  }

  const [
    projects,
    issues,
  ] = await Promise.all([
    findWorkspaceProjects(
      workspaceId,
      normalizedQuery,
    ),
    findWorkspaceIssues(
      workspaceId,
      normalizedQuery,
    ),
  ]);

  return {
    query: normalizedQuery,
    results: {
      projects,
      issues,
    },
    counts: {
      projects: projects.length,
      issues: issues.length,
      total:
        projects.length +
        issues.length,
    },
  };
};