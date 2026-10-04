import assert from "node:assert/strict";
import test from "node:test";

import type { Request, Response } from "express";

import { env } from "../src/config/env.js";
import { createRateLimiter } from "../src/middleware/rate-limit.js";
import {
  loginRateLimiter,
  registerRateLimiter,
} from "../src/modules/auth/auth.routes.js";

const invoke = async (
  limiter: ReturnType<typeof createRateLimiter>,
  clientIp = "test-client",
) => {
  let nextCalled = false;
  let statusCode = 200;
  let responseBody: unknown;
  const headers = new Map<string, number>();

  const request = {
    ip: clientIp,
    socket: { remoteAddress: "127.0.0.1" },
  } as unknown as Request;
  const response = {
    setHeader: (name: string, value: number) => headers.set(name, value),
    status: (value: number) => {
      statusCode = value;
      return response;
    },
    json: (value: unknown) => {
      responseBody = value;
      return response;
    },
  } as unknown as Response;

  limiter(request, response, () => {
    nextCalled = true;
  });

  return { nextCalled, statusCode, responseBody, headers };
};

test("rate limiter allows the configured number of attempts and returns 429", async () => {
  const limiter = createRateLimiter({
    max: 2,
    windowMs: 60_000,
  });

  assert.equal((await invoke(limiter)).nextCalled, true);
  assert.equal((await invoke(limiter)).nextCalled, true);

  const blocked = await invoke(limiter);

  assert.equal(blocked.nextCalled, false);
  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.headers.has("Retry-After"), true);
  assert.deepEqual(blocked.responseBody, {
    success: false,
    error: {
      code: "AUTH_RATE_LIMITED",
      message: "Too many authentication attempts. Please try again later.",
    },
  });
});

test("login rate limiter blocks repeated attempts", async () => {
  const clientIp = `login-test-${Date.now()}`;

  for (let attempt = 0; attempt < env.loginRateLimitMax; attempt += 1) {
    assert.equal((await invoke(loginRateLimiter, clientIp)).nextCalled, true);
  }

  assert.equal((await invoke(loginRateLimiter, clientIp)).statusCode, 429);
});

test("registration rate limiter blocks repeated attempts", async () => {
  const clientIp = `register-test-${Date.now()}`;

  for (let attempt = 0; attempt < env.registerRateLimitMax; attempt += 1) {
    assert.equal((await invoke(registerRateLimiter, clientIp)).nextCalled, true);
  }

  assert.equal((await invoke(registerRateLimiter, clientIp)).statusCode, 429);
});
