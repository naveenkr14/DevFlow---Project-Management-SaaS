import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name must not exceed 100 characters"),

  key: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, "Project key must be at least 2 characters")
    .max(10, "Project key must not exceed 10 characters")
    .regex(
      /^[A-Z0-9]+$/,
      "Project key can contain only uppercase letters and numbers",
    ),

  description: z
    .string()
    .trim()
    .max(500, "Project description must not exceed 500 characters")
    .optional(),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name must not exceed 100 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, "Project description must not exceed 500 characters")
    .optional(),

  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
