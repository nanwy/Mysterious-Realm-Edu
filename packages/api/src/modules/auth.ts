import { createApiClient } from "../client";

const client = createApiClient();

export function login(payload: { username: string; password: string; key?: string }) {
  return client.post("/auth/login", payload);
}

export function getCaptcha(key: string) {
  return client.get(`/auth/randomImage/${key}`);
}

