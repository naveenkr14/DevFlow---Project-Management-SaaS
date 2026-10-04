import {
  createUser,
  findAllUsers,
  findUserByEmail,
} from "./user.repository.js";

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
  return findAllUsers();
};