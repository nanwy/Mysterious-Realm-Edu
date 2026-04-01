"use client";

import { useState, useTransition } from "react";
import { LoaderCircleIcon } from "lucide-react";
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
import {
  extractToken,
  getSuccessMessage,
  normalizeLoginValues,
  validateLoginValues,
} from "./login-form.logic";

export function LoginForm() {
  const [values, setValues] = useState({
    username: "",
    password: "",
    key: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    key: "",
  });
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    const normalized = normalizeLoginValues(values);
    const nextErrors = validateLoginValues(normalized);

    setValues(normalized);
    setErrors({
      username: nextErrors.username ?? "",
      password: nextErrors.password ?? "",
      key: nextErrors.key ?? "",
    });

    if (Object.keys(nextErrors).length > 0) {
      setFeedback({
        tone: "error",
        message: "请先修正表单中的必填项。",
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await login(normalized);
        const payload = unwrapEnvelope(response);
        const token = extractToken(payload);

        if (token) {
          localStorage.setItem("token", token);
        }

        setFeedback({
          tone: "success",
          message: getSuccessMessage(payload),
        });
      } catch (error) {
        setFeedback({
          tone: "error",
          message: error instanceof Error ? error.message : "登录失败",
        });
      }
    });
  }

  function handleFieldChange(field: "username" | "password" | "key", value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

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
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.username)}>
              <FieldLabel htmlFor="login-username">用户名 / 手机号</FieldLabel>
              <Input
                id="login-username"
                aria-invalid={Boolean(errors.username)}
                value={values.username}
                onChange={(event) => handleFieldChange("username", event.target.value)}
                placeholder="请输入用户名或手机号"
              />
              <FieldDescription>
                使用你常用的登录账号或绑定手机号继续学习进度。
              </FieldDescription>
              <FieldError>{errors.username}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="login-password">密码</FieldLabel>
              <Input
                id="login-password"
                type="password"
                aria-invalid={Boolean(errors.password)}
                value={values.password}
                onChange={(event) => handleFieldChange("password", event.target.value)}
                placeholder="请输入登录密码"
              />
              <FieldDescription>
                请输入登录密码，区分大小写。
              </FieldDescription>
              <FieldError>{errors.password}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.key)}>
              <FieldLabel htmlFor="login-key">安全校验码</FieldLabel>
              <Input
                id="login-key"
                aria-invalid={Boolean(errors.key)}
                value={values.key}
                onChange={(event) => handleFieldChange("key", event.target.value)}
                placeholder="请输入安全校验码"
              />
              <FieldDescription>
                用于确认本次登录请求，输入页面提供的校验码即可。
              </FieldDescription>
              <FieldError>{errors.key}</FieldError>
            </Field>
          </FieldGroup>
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? <LoaderCircleIcon data-icon="inline-start" className="animate-spin" /> : null}
            {isPending ? "登录中..." : "进入学习中心"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3 border-0 bg-transparent">
        <FieldDescription>
          登录成功后会保留当前会话，并显示登录状态提示。
        </FieldDescription>
        {feedback ? (
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
        ) : null}
      </CardFooter>
    </Card>
  );
}
