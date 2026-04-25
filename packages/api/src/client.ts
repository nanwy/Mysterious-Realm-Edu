import { buildQuery, type QueryParams } from "./endpoint";
import { ApiError } from "./errors";
import type { ApiEnvelope } from "./types";

export { buildQuery } from "./endpoint";
export { ApiError } from "./errors";
export { unwrapEnvelope } from "./types";

export interface ApiClientOptions {
  baseUrl?: string;
  getToken?: () => string | null | undefined;
}

export interface ApiRequestOptions extends RequestInit {
  query?: QueryParams;
}

export interface ApiHttpClient {
  get: <T>(path: string, init?: ApiRequestOptions) => Promise<ApiEnvelope<T>>;
  post: <T>(
    path: string,
    body?: unknown,
    init?: ApiRequestOptions
  ) => Promise<ApiEnvelope<T>>;
}

export function createApiClient(options: ApiClientOptions = {}): ApiHttpClient {
  const baseUrl =
    options.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  async function request<T>(
    path: string,
    init: ApiRequestOptions = {}
  ): Promise<ApiEnvelope<T>> {
    const { query, ...fetchInit } = init;
    const headers = new Headers(fetchInit.headers);
    if (!(fetchInit.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const token = options.getToken?.();
    if (token) {
      headers.set("X-exam-Token", token);
    }

    const response = await fetch(`${baseUrl}${path}${buildQuery(query)}`, {
      ...fetchInit,
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
    get: <T>(path: string, init?: ApiRequestOptions) => request<T>(path, init),
    post: <T>(path: string, body?: unknown, init?: ApiRequestOptions) =>
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
