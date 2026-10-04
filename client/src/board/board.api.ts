import { apiRequest } from "../lib/api";

import type {
  ProjectBoardResponse,
} from "./board.types";

export const getProjectBoard = async (
  projectId: string,
) => {
  const response =
    await apiRequest<ProjectBoardResponse>(
      `/projects/${projectId}/board`,
    );

  return response.data;
};