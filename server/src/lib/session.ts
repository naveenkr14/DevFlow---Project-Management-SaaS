import { createHash, randomBytes } from "node:crypto";

const SESSION_DURATION_DAYS = 7;

export const generateSessionToken = () => {
  return randomBytes(32).toString("base64url");
};

export const hashSessionToken = (token: string) => {
  return createHash("sha256").update(token).digest("hex");
};

export const getSessionExpiry = () => {
  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  return expiresAt;
};
