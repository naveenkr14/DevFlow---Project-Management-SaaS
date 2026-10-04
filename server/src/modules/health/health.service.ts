import { prisma } from "../../lib/prisma.js";

export const checkDatabaseConnection = async () => {
  const userCount = await prisma.user.count();

  return {
    connected: true,
    userCount,
  };
};
