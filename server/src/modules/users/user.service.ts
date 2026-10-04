import {
  createUser,
  findAllUsers,
  findUserByEmail,
} from "./user.repository.js";
import { toPublicUser } from "./user.dto.js";

export const registerUser = async (data: {
  name: string;
  email: string;
  passwordHash: string;
}) => {
  const existingUser = await findUserByEmail(data.email);

  if (existingUser) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  return createUser(data);
};

export const getUsers = async () => {
  const users = await findAllUsers();

  return users.map(toPublicUser);
};
