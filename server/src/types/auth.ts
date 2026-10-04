import type { Session, User, WorkspaceMember } from "@prisma/client";

type AuthenticatedUser = Pick<
  User,
  "id" | "name" | "email" | "createdAt"
>;

declare global {
  namespace Express {
    interface Request {
      user: AuthenticatedUser;
      session: Session;
      workspaceMembership: WorkspaceMember;
    }
  }
}

export {};
