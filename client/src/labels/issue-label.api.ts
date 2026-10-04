import { apiRequest } from "../lib/api";

import type {
  Label,
  LabelsResponse,
} from "./label.types";

export const getIssueLabels = async (
  issueId: string,
) => {
  const response =
    await apiRequest<LabelsResponse>(
      `/issues/${issueId}/labels`,
    );

  return response.data;
};

export const addLabelToIssue = async (
  issueId: string,
  labelId: string,
) => {
  const response =
    await apiRequest<{
      success: boolean;
      data: Label;
    }>(
      `/issues/${issueId}/labels/${labelId}`,
      {
        method: "POST",
      },
    );

  return response.data;
};

export const removeLabelFromIssue = async (
  issueId: string,
  labelId: string,
) => {
  const response =
    await apiRequest<{
      success: boolean;
      message: string;
    }>(
      `/issues/${issueId}/labels/${labelId}`,
      {
        method: "DELETE",
      },
    );

  return response;
};