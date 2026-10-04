import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters")
    .max(100, "Workspace name must not exceed 100 characters"),

  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Workspace slug must be at least 3 characters")
    .max(50, "Workspace slug must not exceed 50 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Workspace slug can contain only lowercase letters, numbers, and hyphens",
    ),
});

export const addWorkspaceMemberSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),

  role: z.enum(["ADMIN", "MANAGER", "DEVELOPER", "VIEWER"]),
});

export const updateWorkspaceMemberSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "DEVELOPER", "VIEWER"]),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export type AddWorkspaceMemberInput = z.infer<typeof addWorkspaceMemberSchema>;

export type UpdateWorkspaceMemberInput = z.infer<
  typeof updateWorkspaceMemberSchema
>;
