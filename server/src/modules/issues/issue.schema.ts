import { z } from "zod";

export const createIssueSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Issue title must be at least 3 characters")
    .max(
      200,
      "Issue title must not exceed 200 characters",
    ),

  description: z
    .string()
    .trim()
    .max(
      5000,
      "Issue description must not exceed 5000 characters",
    )
    .optional(),

  priority: z
    .enum([
      "LOW",
      "MEDIUM",
      "HIGH",
      "URGENT",
    ])
    .optional(),

  assigneeId: z
    .string()
    .uuid("Invalid assignee ID")
    .optional(),
});

export const updateIssueSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Issue title must be at least 3 characters")
    .max(
      200,
      "Issue title must not exceed 200 characters",
    )
    .optional(),

  description: z
    .string()
    .trim()
    .max(
      5000,
      "Issue description must not exceed 5000 characters",
    )
    .optional(),

  priority: z
    .enum([
      "LOW",
      "MEDIUM",
      "HIGH",
      "URGENT",
    ])
    .optional(),

  assigneeId: z
    .string()
    .uuid("Invalid assignee ID")
    .nullable()
    .optional(),
});

export type CreateIssueInput = z.infer<
  typeof createIssueSchema
>;

export type UpdateIssueInput = z.infer<
  typeof updateIssueSchema
>;