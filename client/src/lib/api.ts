const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim();

const isLocalApiUrl = (value: string) =>
  /^(https?:\/\/)?(localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)(?::\d+)?(?:\/|$)/i.test(
    value,
  );

if (
  import.meta.env.PROD &&
  (!configuredApiBaseUrl ||
    isLocalApiUrl(configuredApiBaseUrl))
) {
  throw new Error(
    "VITE_API_BASE_URL must be set to a production API URL or /api/v1.",
  );
}

const API_BASE_URL =
  configuredApiBaseUrl ?? "http://localhost:5000/api/v1";

type ApiErrorResponse = {
  success?: false;
  error?: {
    code?: string;
    message?: string;
  };
};

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(
    message: string,
    status: number,
    code?: string,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = RequestInit & {
  body?: BodyInit | null;
};

export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const errorData = data as ApiErrorResponse | null;

    throw new ApiError(
      errorData?.error?.message ?? "Something went wrong.",
      response.status,
      errorData?.error?.code,
    );
  }

  return data as T;
};

export { API_BASE_URL };
