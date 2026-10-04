import { createContext } from "react";

import type { AuthUser } from "./auth.types";

export type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);
