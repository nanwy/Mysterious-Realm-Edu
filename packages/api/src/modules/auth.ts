import { createApiClient, type ApiHttpClient } from "../client";

export const createAuthApi = (client: ApiHttpClient) => ({
  login: (payload: { username: string; password: string; key?: string }) =>
    client.post("/auth/login", payload),

  getCaptcha: ({ key }: { key: string }) =>
    client.get(`/auth/randomImage/${encodeURIComponent(key)}`),
});

const defaultAuthApi = createAuthApi(createApiClient());

export function login(payload: { username: string; password: string; key?: string }) {
  return defaultAuthApi.login(payload);
}

export function getCaptcha(key: string) {
  return defaultAuthApi.getCaptcha({ key });
}
