import { z } from "zod";

export const createLabelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Label name must not be empty")
    .max(50, "Label name must not exceed 50 characters"),

  color: z
    .string()
    .trim()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "Label color must be a valid hexadecimal color",
    ),
});

export const updateLabelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Label name must not be empty")
    .max(50, "Label name must not exceed 50 characters")
    .optional(),

  color: z
    .string()
    .trim()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "Label color must be a valid hexadecimal color",
    )
    .optional(),
});

export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;