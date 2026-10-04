import type { ErrorRequestHandler, Request, Response } from "express";

type RequestError = {
  code?: unknown;
  status?: unknown;
  statusCode?: unknown;
  type?: unknown;
  message?: unknown;
};

const getStatusCode = (error: RequestError) => {
  const candidate = error.statusCode ?? error.status;

  return typeof candidate === "number" && candidate >= 400 && candidate < 600
    ? candidate
    : 500;
};

const sendError = (
  res: Response,
  status: number,
  code: string,
  message: string,
) => {
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  sendError(
    res,
    404,
    "NOT_FOUND",
    `Route ${req.method} ${req.path} was not found.`,
  );
};

export const globalErrorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next,
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const requestError = (error ?? {}) as RequestError;

  if (requestError.type === "entity.too.large") {
    sendError(
      res,
      413,
      "REQUEST_BODY_TOO_LARGE",
      "Request body is too large.",
    );
    return;
  }

  if (requestError.type === "entity.parse.failed") {
    sendError(
      res,
      400,
      "INVALID_JSON",
      "Request body must contain valid JSON.",
    );
    return;
  }

  const status = getStatusCode(requestError);
  const isClientError = status >= 400 && status < 500;
  const code = isClientError && typeof requestError.code === "string"
    ? requestError.code
    : "INTERNAL_SERVER_ERROR";
  const message = isClientError && typeof requestError.message === "string"
    ? requestError.message
    : "Internal server error.";

  console.error("Unhandled request error", {
    method: req.method,
    path: req.originalUrl,
    status,
    errorType: error instanceof Error ? error.name : "UnknownError",
  });

  sendError(res, status, code, message);
};
