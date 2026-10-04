type CommentMutationAuthorizationInput = {
  commentAuthorId: string;
  userId: string;
  hasWorkspaceMembership: boolean;
};

const assertCommentMutationAllowed = ({
  commentAuthorId,
  userId,
  hasWorkspaceMembership,
}: CommentMutationAuthorizationInput) => {
  if (!hasWorkspaceMembership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  if (commentAuthorId !== userId) {
    throw new Error("COMMENT_AUTHOR_ONLY");
  }
};

export const assertCommentUpdateAllowed = (
  input: CommentMutationAuthorizationInput,
) => assertCommentMutationAllowed(input);

export const assertCommentDeletionAllowed = (
  input: CommentMutationAuthorizationInput,
) => assertCommentMutationAllowed(input);
