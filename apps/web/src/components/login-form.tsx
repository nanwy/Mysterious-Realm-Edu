"use client";

import { useForm } from "@tanstack/react-form";
import { login, unwrapEnvelope } from "@workspace/api";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  ThemeToggle,
} from "@workspace/ui";
import { LoaderCircleIcon } from "lucide-react";
import {
  extractToken,
  getSuccessMessage,
  normalizeLoginValues,
  type LoginValues,
} from "./login-form.logic";

type LoginField = keyof LoginValues;

interface LoginFormValues extends LoginValues {
  feedbackMessage: string;
  feedbackTone: "" | "success" | "error";
}

interface LoginFormApi {
  setFieldValue: (field: keyof LoginFormValues, value: any) => void;
  setFieldMeta: (field: LoginField, updater: any) => void;
}

const requiredMessages: Record<LoginField, string> = {
  username: "请输入用户名或手机号",
  password: "请输入密码",
  key: "请输入安全校验码",
};

function validateRequiredField(field: LoginField, value: string) {
  return value.trim() ? undefined : requiredMessages[field];
}

function clearFeedback(form: LoginFormApi) {
  form.setFieldValue("feedbackTone", "");
  form.setFieldValue("feedbackMessage", "");
}

function setFeedback(form: LoginFormApi, tone: LoginFormValues["feedbackTone"], message: string) {
  form.setFieldValue("feedbackTone", tone);
  form.setFieldValue("feedbackMessage", message);
}

function markFieldsTouched(form: LoginFormApi) {
  for (const field of ["username", "password", "key"] as const) {
    form.setFieldMeta(field, (meta: any) => ({ ...meta, isTouched: true }));
  }
}

function syncNormalizedValues(form: LoginFormApi, values: LoginValues) {
  form.setFieldValue("username", values.username);
  form.setFieldValue("password", values.password);
  form.setFieldValue("key", values.key);
}

function toFieldErrors(errors: ReadonlyArray<unknown>) {
  return errors
    .filter((error): error is string => typeof error === "string" && error.length > 0)
    .map((message) => ({ message }));
}

export function LoginForm() {
  const defaultValues: LoginFormValues = {
    username: "",
    password: "",
    key: "",
    feedbackMessage: "",
    feedbackTone: "",
  };

  const form = useForm({
    defaultValues,
    onSubmitInvalid: ({ value, formApi }) => {
      syncNormalizedValues(
        formApi,
        normalizeLoginValues({
          username: value.username,
          password: value.password,
          key: value.key,
        })
      );
      markFieldsTouched(formApi);
      setFeedback(formApi, "error", "请先修正表单中的必填项。");
    },
    onSubmit: async ({ value, formApi }) => {
      clearFeedback(formApi);

      const normalized = normalizeLoginValues({
        username: value.username,
        password: value.password,
        key: value.key,
      });

      syncNormalizedValues(formApi, normalized);

      try {
        const response = await login(normalized);
        const payload = unwrapEnvelope(response);
        const token = extractToken(payload);

        if (token) {
          localStorage.setItem("token", token);
        }

        setFeedback(formApi, "success", getSuccessMessage(payload));
      } catch (error) {
        setFeedback(
          formApi,
          "error",
          error instanceof Error ? error.message : "登录失败"
        );
      }
    },
  });

  return (
    <Card className="shadow-2xl backdrop-blur-sm">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary">学员入口</Badge>
          <ThemeToggle />
        </div>
        <CardTitle>欢迎登录</CardTitle>
        <CardDescription>
          使用账号、密码与安全校验完成登录，继续你的课程、题库与考试进度。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="username"
              validators={{
                onBlur: ({ value }) => validateRequiredField("username", value),
                onChange: ({ value }) =>
                  validateRequiredField("username", value),
                onSubmit: ({ value }) =>
                  validateRequiredField("username", value),
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="login-username">
                      用户名 / 手机号
                    </FieldLabel>
                    <Input
                      id="login-username"
                      name={field.name}
                      aria-invalid={isInvalid}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value);
                        clearFeedback(form);
                      }}
                      placeholder="请输入用户名或手机号"
                    />
                    <FieldDescription>
                      使用你常用的登录账号或绑定手机号继续学习进度。
                    </FieldDescription>
                    {isInvalid ? (
                      <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field
              name="password"
              validators={{
                onBlur: ({ value }) => validateRequiredField("password", value),
                onChange: ({ value }) =>
                  validateRequiredField("password", value),
                onSubmit: ({ value }) =>
                  validateRequiredField("password", value),
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="login-password">密码</FieldLabel>
                    <Input
                      id="login-password"
                      name={field.name}
                      type="password"
                      aria-invalid={isInvalid}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value);
                        clearFeedback(form);
                      }}
                      placeholder="请输入登录密码"
                    />
                    <FieldDescription>
                      请输入登录密码，区分大小写。
                    </FieldDescription>
                    {isInvalid ? (
                      <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field
              name="key"
              validators={{
                onBlur: ({ value }) => validateRequiredField("key", value),
                onChange: ({ value }) => validateRequiredField("key", value),
                onSubmit: ({ value }) => validateRequiredField("key", value),
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="login-key">安全校验码</FieldLabel>
                    <Input
                      id="login-key"
                      name={field.name}
                      aria-invalid={isInvalid}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value);
                        clearFeedback(form);
                      }}
                      placeholder="请输入安全校验码"
                    />
                    <FieldDescription>
                      用于确认本次登录请求，输入页面提供的校验码即可。
                    </FieldDescription>
                    {isInvalid ? (
                      <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <LoaderCircleIcon
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                ) : null}
                {isSubmitting ? "登录中..." : "进入学习中心"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3 border-0 bg-transparent">
        <FieldDescription>
          登录成功后会保留当前会话，并显示登录状态提示。
        </FieldDescription>
        <form.Subscribe
          selector={(state) => ({
            message: state.values.feedbackMessage,
            tone: state.values.feedbackTone,
          })}
        >
          {(feedback) =>
            feedback.message ? (
              <div
                role={feedback.tone === "error" ? "alert" : "status"}
                className={
                  feedback.tone === "success"
                    ? "rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
                    : "rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                }
              >
                {feedback.message}
              </div>
            ) : null
          }
        </form.Subscribe>
      </CardFooter>
    </Card>
  );
}
