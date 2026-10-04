import { apiRequest } from "../lib/api";

import type {
  ActivityFilters,
  ActivityResponse,
} from "./activity.types";

export const getActivities = async (
  workspaceId: string,
  filters: ActivityFilters = {},
) => {
  const params = new URLSearchParams();

  if (filters.action) {
    params.set("action", filters.action);
  }

  if (filters.entityType) {
    params.set("entityType", filters.entityType);
  }

  if (filters.limit !== undefined) {
    params.set("limit", String(filters.limit));
  }

  if (filters.cursor) {
    params.set("cursor", filters.cursor);
  }

  const query = params.toString();

  const response = await apiRequest<ActivityResponse>(
    `/workspaces/${workspaceId}/activities${query ? `?${query}` : ""}`,
  );

  return response;
};