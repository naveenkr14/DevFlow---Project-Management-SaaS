import {
  createComment,
  deleteComment,
  findCommentById,
  findCommentsByIssueId,
  findIssueById,
  findWorkspaceMembership,
  updateComment,
} from "./comment.repository.js";

import type {
  CreateCommentInput,
  UpdateCommentInput,
} from "./comment.schema.js";

import { createActivityService } from "../activities/activity.service.js";

export const createCommentService = async (
  issueId: string,
  userId: string,
  data: CreateCommentInput,
) => {
  const issue = await findIssueById(issueId);

  if (!issue) {
    throw new Error("ISSUE_NOT_FOUND");
  }

  const membership = await findWorkspaceMembership(
    issue.project.workspaceId,
    userId,
  );

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  const comment = await createComment({
    issueId,
    authorId: userId,
    content: data.content,
  });

  await createActivityService({
    workspaceId: issue.project.workspaceId,
    userId,
    action: "COMMENT_CREATED",
    entityType: "COMMENT",
    entityId: comment.id,
    metadata: {
      issueId,
      content: comment.content,
    },
  });

  return comment;
};

export const getIssueCommentsService = async (
  issueId: string,
  userId: string,
) => {
  const issue = await findIssueById(issueId);

  if (!issue) {
    throw new Error("ISSUE_NOT_FOUND");
  }

  const membership = await findWorkspaceMembership(
    issue.project.workspaceId,
    userId,
  );

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  return findCommentsByIssueId(issueId);
};

export const updateCommentService = async (
  commentId: string,
  userId: string,
  data: UpdateCommentInput,
) => {
  const comment = await findCommentById(commentId);

  if (!comment) {
    throw new Error("COMMENT_NOT_FOUND");
  }

  if (comment.authorId !== userId) {
    throw new Error("COMMENT_EDIT_FORBIDDEN");
  }

  const oldContent = comment.content;

  const updatedComment = await updateComment(
    commentId,
    data.content,
  );

  await createActivityService({
    workspaceId: comment.issue.project.workspaceId,
    userId,
    action: "COMMENT_UPDATED",
    entityType: "COMMENT",
    entityId: comment.id,
    metadata: {
      issueId: comment.issueId,
      oldContent,
      newContent: updatedComment.content,
    },
  });

  return updatedComment;
};

export const deleteCommentService = async (
  commentId: string,
  userId: string,
) => {
  const comment = await findCommentById(commentId);

  if (!comment) {
    throw new Error("COMMENT_NOT_FOUND");
  }

  if (comment.authorId !== userId) {
    throw new Error("COMMENT_DELETE_FORBIDDEN");
  }

  const deletedComment = await deleteComment(
    commentId,
  );

  await createActivityService({
    workspaceId: comment.issue.project.workspaceId,
    userId,
    action: "COMMENT_DELETED",
    entityType: "COMMENT",
    entityId: comment.id,
    metadata: {
      issueId: comment.issueId,
      content: deletedComment.content,
    },
  });

  return {
    id: commentId,
  };
};