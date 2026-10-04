export type CommentAuthor = {
  id: string;
  name: string;
  email: string;
};

export type Comment = {
  id: string;
  issueId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
};

export type CommentsResponse = {
  success: boolean;
  data: Comment[];
};

export type CommentResponse = {
  success: boolean;
  data: Comment;
};

export type CreateCommentInput = {
  content: string;
};

export type UpdateCommentInput = {
  content: string;
};

export type DeleteCommentResponse = {
  success: boolean;
  message: string;
};