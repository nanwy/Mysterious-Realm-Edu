import type { ApiEnvelope } from "@workspace/shared";

export interface ApiClientOptions {
  baseUrl?: string;
  getToken?: () => string | null | undefined;
}

export class ApiError extends Error {
  public readonly code: number;
  public readonly status: number;

  constructor(
    message: string,
    code: number,
    status: number
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export function unwrapEnvelope<T>(payload: ApiEnvelope<T>) {
  return payload.result ?? payload.data ?? null;
}

export function buildQuery(
  params: Record<string, string | number | boolean | null | undefined>
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }

  const result = query.toString();
  return result ? `?${result}` : "";
}

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl =
    options.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  async function request<T>(
    path: string,
    init: RequestInit = {}
  ): Promise<ApiEnvelope<T>> {
    const headers = new Headers(init.headers);
    if (!(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const token = options.getToken?.();
    if (token) {
      headers.set("X-exam-Token", token);
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new ApiError("网络请求失败", -1, response.status);
    }

    const payload = (await response.json()) as ApiEnvelope<T>;
    if (payload.code !== 200) {
      throw new ApiError(payload.message || "服务异常", payload.code, response.status);
    }

    return payload;
  }

  return {
    get: <T>(path: string, init?: RequestInit) => request<T>(path, init),
    post: <T>(path: string, body?: unknown, init?: RequestInit) =>
      request<T>(path, {
        method: "POST",
        body:
          body instanceof FormData
            ? body
            : body
              ? JSON.stringify(body)
              : undefined,
        ...init,
      }),
  };
}
