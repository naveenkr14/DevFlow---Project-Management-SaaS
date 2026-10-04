import { z } from "zod";

export const updateIssueStatusSchema = z.object({
  status: z.enum([
    "TODO",
    "IN_PROGRESS",
    "IN_REVIEW",
    "DONE",
  ]),
});

export type UpdateIssueStatusInput = z.infer<
  typeof updateIssueStatusSchema
>;