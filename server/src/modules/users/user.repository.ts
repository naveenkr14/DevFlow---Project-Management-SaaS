import { prisma } from "../../lib/prisma.js";

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const createUser = async (data: {
  name: string;
  email: string;
  passwordHash: string;
}) => {
  return prisma.user.create({
    data,
  });
};

export const findAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};
