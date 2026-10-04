import type { Session, User, WorkspaceMember } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user: User;
      session: Session;
      workspaceMembership: WorkspaceMember;
    }
  }
}

export {};
