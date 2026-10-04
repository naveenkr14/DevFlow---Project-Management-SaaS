import { apiRequest } from "../lib/api";

import type {
  CreateIssueInput,
  IssueResponse,
  IssuesResponse,
  UpdateIssueInput,
  UpdateIssueStatusInput,
} from "./issue.types";

export const getProjectIssues = async (
  projectId: string,
) => {
  const response =
    await apiRequest<IssuesResponse>(
      `/projects/${projectId}/issues`,
    );

  return response.data;
};

export const createIssue = async (
  projectId: string,
  input: CreateIssueInput,
) => {
  const response =
    await apiRequest<IssueResponse>(
      `/projects/${projectId}/issues`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );

  return response.data;
};

export const getIssue = async (
  issueId: string,
) => {
  const response =
    await apiRequest<IssueResponse>(
      `/issues/${issueId}`,
    );

  return response.data;
};

export const updateIssue = async (
  issueId: string,
  input: UpdateIssueInput,
) => {
  const response =
    await apiRequest<IssueResponse>(
      `/issues/${issueId}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
    );

  return response.data;
};

export const updateIssueStatus = async (
  issueId: string,
  input: UpdateIssueStatusInput,
) => {
  const response =
    await apiRequest<IssueResponse>(
      `/issues/${issueId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
    );

  return response.data;
};