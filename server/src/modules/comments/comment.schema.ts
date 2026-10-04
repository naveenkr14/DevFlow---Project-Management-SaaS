import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(
      1,
      "Comment content must not be empty",
    )
    .max(
      5000,
      "Comment content must not exceed 5000 characters",
    ),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(
      1,
      "Comment content must not be empty",
    )
    .max(
      5000,
      "Comment content must not exceed 5000 characters",
    ),
});

export type CreateCommentInput = z.infer<
  typeof createCommentSchema
>;

export type UpdateCommentInput = z.infer<
  typeof updateCommentSchema
>;