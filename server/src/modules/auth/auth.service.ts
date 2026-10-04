import argon2 from "argon2";
import { createUser, findUserByEmail } from "../users/user.repository.js";
import { createSession, deleteSession } from "./auth.repository.js";
import {
  generateSessionToken,
  getSessionExpiry,
  hashSessionToken,
} from "../../lib/session.js";

type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

type LoginUserInput = {
  email: string;
  password: string;
};

export const registerUser = async (data: RegisterUserInput) => {
  const existingUser = await findUserByEmail(data.email);

  if (existingUser) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  const passwordHash = await argon2.hash(data.password);

  const user = await createUser({
    name: data.name,
    email: data.email,
    passwordHash,
  });

  return user;
};

export const loginUser = async (data: LoginUserInput) => {
  const user = await findUserByEmail(data.email);

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordIsValid = await argon2.verify(user.passwordHash, data.password);

  if (!passwordIsValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = getSessionExpiry();

  await createSession({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  return {
    user,
    token,
    expiresAt,
  };
};

export const logoutUser = async (sessionId: string) => {
  await deleteSession(sessionId);
};
