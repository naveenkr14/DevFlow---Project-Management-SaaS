import { apiRequest } from "../lib/api";

import type {
  CreateLabelInput,
  DeleteLabelResponse,
  LabelResponse,
  LabelsResponse,
  UpdateLabelInput,
} from "./label.types";

export const getProjectLabels = async (
  projectId: string,
) => {
  const response =
    await apiRequest<LabelsResponse>(
      `/projects/${projectId}/labels`,
    );

  return response.data;
};

export const createLabel = async (
  projectId: string,
  input: CreateLabelInput,
) => {
  const response =
    await apiRequest<LabelResponse>(
      `/projects/${projectId}/labels`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );

  return response.data;
};

export const updateLabel = async (
  labelId: string,
  input: UpdateLabelInput,
) => {
  const response =
    await apiRequest<LabelResponse>(
      `/labels/${labelId}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
    );

  return response.data;
};

export const deleteLabel = async (
  labelId: string,
) => {
  const response =
    await apiRequest<DeleteLabelResponse>(
      `/labels/${labelId}`,
      {
        method: "DELETE",
      },
    );

  return response;
};