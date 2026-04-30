import type { ApiHttpClient } from "../client";
import type {
  AuthCaptchaRequest,
  AuthCaptchaResponse,
  AuthLoginRequest,
  AuthLoginResponse,
} from "../types/auth";

export const createAuthApi = (client: ApiHttpClient) => ({
  login: (payload: AuthLoginRequest) =>
    client.post<AuthLoginResponse>("/auth/login", payload),

  getCaptcha: ({ key }: AuthCaptchaRequest) =>
    client.get<AuthCaptchaResponse>(`/auth/randomImage/${encodeURIComponent(key)}`),
});
