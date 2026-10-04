import { apiRequest } from "../lib/api";

import type {
  DashboardResponse,
} from "./dashboard.types";

export const getWorkspaceDashboard = async (
  workspaceId: string,
) => {
  const response =
    await apiRequest<DashboardResponse>(
      `/workspaces/${workspaceId}/dashboard`,
    );

  return response.data;
};
