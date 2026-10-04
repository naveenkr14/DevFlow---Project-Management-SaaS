import {
  findBoardIssuesByProjectId,
  findProjectById,
  findWorkspaceMembership,
} from "./board.repository.js";

export const getProjectBoardService = async (
  projectId: string,
  userId: string,
) => {
  const project = await findProjectById(projectId);

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  const membership = await findWorkspaceMembership(
    project.workspaceId,
    userId,
  );

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  const issues =
    await findBoardIssuesByProjectId(projectId);

  const board = {
    TODO: [],
    IN_PROGRESS: [],
    IN_REVIEW: [],
    DONE: [],
  } as {
    TODO: typeof issues;
    IN_PROGRESS: typeof issues;
    IN_REVIEW: typeof issues;
    DONE: typeof issues;
  };

  for (const issue of issues) {
    board[issue.status].push(issue);
  }

  return {
    project: {
      id: project.id,
      name: project.name,
      key: project.key,
      description: project.description,
      status: project.status,
    },
    columns: board,
  };
};