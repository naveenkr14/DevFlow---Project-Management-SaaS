import type { User } from "@prisma/client";

export type PublicUser = Pick<
  User,
  "id" | "name" | "email" | "createdAt"
>;

export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} as const;

export const toPublicUser = (user: PublicUser): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});
