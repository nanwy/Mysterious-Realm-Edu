export interface LoginValues {
  username: string;
  password: string;
  key: string;
}

export type LoginErrors = Partial<Record<keyof LoginValues, string>>;

export function normalizeLoginValues(values: LoginValues): LoginValues {
  return {
    username: values.username.trim(),
    password: values.password.trim(),
    key: values.key.trim(),
  };
}

export function validateLoginValues(values: LoginValues): LoginErrors {
  const normalized = normalizeLoginValues(values);
  const errors: LoginErrors = {};

  if (!normalized.username) {
    errors.username = "请输入用户名或手机号";
  }

  if (!normalized.password) {
    errors.password = "请输入密码";
  }

  if (!normalized.key) {
    errors.key = "请输入安全校验码";
  }

  return errors;
}

export function extractToken(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;

  const candidates = [
    record.token,
    record.accessToken,
    record.idToken,
    record.id_token,
  ];

  return candidates.find((item): item is string => typeof item === "string") ?? null;
}

export function getSuccessMessage(payload: unknown) {
  return extractToken(payload)
    ? "登录成功，欢迎回到云学考。"
    : "登录成功，正在为你同步学习数据。";
}
