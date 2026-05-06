import { z } from "zod";

const requiredMessages = {
  username: "请输入用户名或手机号",
  password: "请输入密码",
  key: "请输入安全校验码",
} as const;

export const loginValuesSchema = z.object({
  username: z.string().trim().min(1, requiredMessages.username),
  password: z.string().trim().min(1, requiredMessages.password),
  key: z.string().trim().min(1, requiredMessages.key),
});

export type LoginValues = z.infer<typeof loginValuesSchema>;

export const loginFormSchema = loginValuesSchema.extend({
  feedbackMessage: z.string(),
  feedbackTone: z.enum(["", "success", "error"]),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export type LoginErrors = Partial<Record<keyof LoginValues, string>>;

export function normalizeLoginValues(values: LoginValues): LoginValues {
  return loginValuesSchema.parse(values);
}

export function validateLoginValues(values: LoginValues): LoginErrors {
  const result = loginValuesSchema.safeParse(values);
  const errors: LoginErrors = {};

  if (result.success) {
    return errors;
  }

  for (const issue of result.error.issues) {
    const field = issue.path[0];

    if (
      field === "username" ||
      field === "password" ||
      field === "key"
    ) {
      errors[field] ??= issue.message;
    }
  }

  return errors;
}

export function getFailureMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "登录失败，请稍后重试。";
}
