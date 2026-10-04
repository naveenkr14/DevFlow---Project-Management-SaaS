import { apiRequest } from "../lib/api";

import type {
  SearchResponse,
} from "./search.types";

export const searchWorkspace = async (
  workspaceId: string,
  query: string,
) => {
  const params = new URLSearchParams({
    q: query,
  });

  const response =
    await apiRequest<SearchResponse>(
      `/workspaces/${workspaceId}/search?${params.toString()}`,
    );

  return response.data;
};