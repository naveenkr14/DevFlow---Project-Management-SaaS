type CommentMutation = "update" | "delete";

export const getCommentAuthorizationError = (
  error: unknown,
  mutation: CommentMutation,
) => {
  if (!(error instanceof Error)) {
    return null;
  }

  if (error.message === "WORKSPACE_ACCESS_DENIED") {
    return {
      status: 403,
      error: {
        code: "WORKSPACE_ACCESS_DENIED",
        message: "You do not have access to this comment.",
      },
    };
  }

  if (error.message === "COMMENT_AUTHOR_ONLY") {
    return {
      status: 403,
      error: {
        code: "COMMENT_AUTHOR_ONLY",
        message: mutation === "update"
          ? "Only the comment author can update this comment."
          : "Only the comment author can delete this comment.",
      },
    };
  }

  return null;
};
