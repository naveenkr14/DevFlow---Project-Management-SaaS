import "dotenv/config";

const parsePositiveInteger = (name: string, fallback: number) => {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue === "") {
    return fallback;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
};

const parseNonNegativeInteger = (name: string, fallback: number) => {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue === "") {
    return fallback;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer.`);
  }

  return value;
};

const nodeEnv = process.env.NODE_ENV ?? "development";

if (!(["development", "test", "production"] as const).includes(
  nodeEnv as "development" | "test" | "production",
)) {
  throw new Error("NODE_ENV must be development, test, or production.");
}

const isProduction = nodeEnv === "production";
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

const configuredFrontendUrl = process.env.FRONTEND_URL;
const frontendUrl = configuredFrontendUrl ?? "http://localhost:5173";

if (isProduction && !configuredFrontendUrl) {
  throw new Error("FRONTEND_URL is required when NODE_ENV=production.");
}

try {
  const parsedFrontendUrl = new URL(frontendUrl);

  if (
    parsedFrontendUrl.pathname !== "/" ||
    parsedFrontendUrl.search ||
    parsedFrontendUrl.hash ||
    parsedFrontendUrl.username ||
    parsedFrontendUrl.password
  ) {
    throw new Error("FRONTEND_URL must contain only an origin.");
  }

  if (isProduction && parsedFrontendUrl.protocol !== "https:") {
    throw new Error("FRONTEND_URL must use HTTPS in production.");
  }
} catch (error) {
  if (error instanceof Error && error.message.includes("must contain")) {
    throw error;
  }

  throw new Error("FRONTEND_URL must be a valid origin.");
}

if (isProduction && !process.env.PORT) {
  throw new Error("PORT is required when NODE_ENV=production.");
}

const port = process.env.PORT === undefined
  ? 5000
  : Number(process.env.PORT);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error("PORT must be a valid TCP port.");
}

export const env = {
  nodeEnv,
  isProduction,
  databaseUrl,
  frontendUrl,
  port,
  trustProxyHops: parseNonNegativeInteger("TRUST_PROXY_HOPS", 0),
  loginRateLimitMax: parsePositiveInteger("AUTH_LOGIN_RATE_LIMIT_MAX", 10),
  loginRateLimitWindowMs: parsePositiveInteger(
    "AUTH_LOGIN_RATE_LIMIT_WINDOW_MS",
    15 * 60 * 1000,
  ),
  registerRateLimitMax: parsePositiveInteger(
    "AUTH_REGISTER_RATE_LIMIT_MAX",
    5,
  ),
  registerRateLimitWindowMs: parsePositiveInteger(
    "AUTH_REGISTER_RATE_LIMIT_WINDOW_MS",
    60 * 60 * 1000,
  ),
};
