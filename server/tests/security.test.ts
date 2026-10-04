import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import test from "node:test";

import app from "../src/app.js";
import { globalErrorHandler } from "../src/middleware/error-handler.js";
import {
  assertCommentDeletionAllowed,
  assertCommentUpdateAllowed,
} from "../src/modules/comments/comment.authorization.js";
import { getCommentAuthorizationError } from "../src/modules/comments/comment.errors.js";
import {
  publicUserSelect,
  toPublicUser,
} from "../src/modules/users/user.dto.js";

const createResponseCapture = () => {
  let statusCode = 200;
  let body: unknown;

  const response = {
    headersSent: false,
    status: (value: number) => {
      statusCode = value;
      return response;
    },
    json: (value: unknown) => {
      body = value;
      return response;
    },
  };

  return {
    response,
    get statusCode() {
      return statusCode;
    },
    get body() {
      return body;
    },
  };
};

const startTestServer = async () => {
  const server = createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();

  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Test server did not expose a TCP port.");
  }

  return {
    server,
    url: `http://127.0.0.1:${address.port}`,
  };
};

const stopTestServer = async (server: Server) => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
};

test("users endpoint rejects unauthenticated requests", async () => {
  const { server, url } = await startTestServer();

  try {
    const response = await fetch(`${url}/api/v1/users`);
    const body = await response.json() as {
      success: boolean;
      error?: { code?: string };
    };

    assert.equal(response.status, 401);
    assert.equal(body.success, false);
    assert.equal(body.error?.code, "UNAUTHENTICATED");
  } finally {
    await stopTestServer(server);
  }
});

test("users endpoint DTO cannot contain password or session secrets", () => {
  assert.deepEqual(Object.keys(publicUserSelect).sort(), [
    "createdAt",
    "email",
    "id",
    "name",
  ]);
  assert.equal("passwordHash" in publicUserSelect, false);
  assert.equal("sessionTokenHash" in publicUserSelect, false);

  const publicUser = toPublicUser({
    id: "user-id",
    name: "Test User",
    email: "test@example.com",
    createdAt: new Date(),
    passwordHash: "should-not-escape",
    sessionTokenHash: "should-not-escape",
  } as never);

  assert.equal("passwordHash" in publicUser, false);
  assert.equal("sessionTokenHash" in publicUser, false);
});

test("unauthorized comment update requires current workspace membership", () => {
  assert.throws(
    () => assertCommentUpdateAllowed({
      commentAuthorId: "author-id",
      userId: "author-id",
      hasWorkspaceMembership: false,
    }),
    /WORKSPACE_ACCESS_DENIED/,
  );

});

test("unauthorized comment deletion requires current workspace membership", () => {
  assert.throws(
    () => assertCommentDeletionAllowed({
      commentAuthorId: "author-id",
      userId: "other-user-id",
      hasWorkspaceMembership: false,
    }),
    /WORKSPACE_ACCESS_DENIED/,
  );
});

test("valid comment update and deletion remain author-only for members", () => {
  assert.throws(
    () => assertCommentUpdateAllowed({
      commentAuthorId: "author-id",
      userId: "other-user-id",
      hasWorkspaceMembership: true,
    }),
    /COMMENT_AUTHOR_ONLY/,
  );

  assert.throws(
    () => assertCommentDeletionAllowed({
      commentAuthorId: "author-id",
      userId: "other-user-id",
      hasWorkspaceMembership: true,
    }),
    /COMMENT_AUTHOR_ONLY/,
  );

  assert.doesNotThrow(() => assertCommentUpdateAllowed({
    commentAuthorId: "author-id",
    userId: "author-id",
    hasWorkspaceMembership: true,
  }));

  assert.doesNotThrow(() => assertCommentDeletionAllowed({
    commentAuthorId: "author-id",
    userId: "author-id",
    hasWorkspaceMembership: true,
  }));
});

test("comment authorization errors map to HTTP 403", () => {
  assert.deepEqual(
    getCommentAuthorizationError(new Error("WORKSPACE_ACCESS_DENIED"), "update"),
    {
      status: 403,
      error: {
        code: "WORKSPACE_ACCESS_DENIED",
        message: "You do not have access to this comment.",
      },
    },
  );

  assert.deepEqual(
    getCommentAuthorizationError(new Error("COMMENT_AUTHOR_ONLY"), "delete"),
    {
      status: 403,
      error: {
        code: "COMMENT_AUTHOR_ONLY",
        message: "Only the comment author can delete this comment.",
      },
    },
  );
});

test("unexpected errors return a generic 500 response", () => {
  const capture = createResponseCapture();

  globalErrorHandler(
    new Error("sensitive internal database detail"),
    {
      method: "GET",
      originalUrl: "/api/v1/test",
    } as never,
    capture.response as never,
    () => undefined,
  );

  assert.equal(capture.statusCode, 500);
  assert.deepEqual(capture.body, {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
    },
  });
});
