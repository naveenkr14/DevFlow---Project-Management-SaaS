import { prisma } from "../../lib/prisma.js";
import { publicUserSelect } from "../users/user.dto.js";

export const createSession = async (data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) => {
  return prisma.session.create({
    data,
  });
};

export const findSessionByTokenHash = async (tokenHash: string) => {
  return prisma.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
        select: publicUserSelect,
      },
    },
  });
};

export const deleteSession = async (sessionId: string) => {
  return prisma.session.delete({
    where: {
      id: sessionId,
    },
  });
};
