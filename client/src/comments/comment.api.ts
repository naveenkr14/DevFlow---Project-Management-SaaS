import { apiRequest } from "../lib/api";

import type {
  CommentResponse,
  CommentsResponse,
  CreateCommentInput,
  DeleteCommentResponse,
  UpdateCommentInput,
} from "./comment.types";

export const getIssueComments = async (
  issueId: string,
) => {
  const response =
    await apiRequest<CommentsResponse>(
      `/issues/${issueId}/comments`,
    );

  return response.data;
};

export const createComment = async (
  issueId: string,
  input: CreateCommentInput,
) => {
  const response =
    await apiRequest<CommentResponse>(
      `/issues/${issueId}/comments`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );

  return response.data;
};

export const updateComment = async (
  commentId: string,
  input: UpdateCommentInput,
) => {
  const response =
    await apiRequest<CommentResponse>(
      `/comments/${commentId}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
    );

  return response.data;
};

export const deleteComment = async (
  commentId: string,
) => {
  const response =
    await apiRequest<DeleteCommentResponse>(
      `/comments/${commentId}`,
      {
        method: "DELETE",
      },
    );

  return response;
};