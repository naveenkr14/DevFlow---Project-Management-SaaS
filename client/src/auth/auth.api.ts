import { apiRequest } from "../lib/api";
import type {
  AuthMeResponse,
  AuthUser,
} from "./auth.types";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type AuthResponse = {
  success: boolean;
  message?: string;
  data?: AuthUser;
};

export const registerUser = async (
  input: RegisterInput,
) => {
  const response = await apiRequest<AuthResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response;
};

export const loginUser = async (
  input: LoginInput,
) => {
  const response = await apiRequest<AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response;
};

export const getCurrentUser = async () => {
  const response = await apiRequest<AuthMeResponse>(
    "/auth/me",
  );

  return response.data;
};

export const logoutUser = async () => {
  await apiRequest("/auth/logout", {
    method: "POST",
  });
};