"use client";

import { useState, useTransition } from "react";
import { login, unwrapEnvelope } from "@workspace/api";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
    <Card className="border border-white/70 bg-white/85 shadow-[0_32px_90px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/10 dark:bg-slate-950/80">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary" className="bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200">
            学员入口
          </Badge>
          <ThemeToggle />
        </div>
        <CardTitle>欢迎登录</CardTitle>
        <CardDescription>
          使用账号、密码与安全校验完成登录，继续你的课程、题库与考试进度。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              用户名 / 手机号
            </span>
            <Input
              aria-invalid={Boolean(errors.username)}
              value={values.username}
              onChange={(event) => handleFieldChange("username", event.target.value)}
              placeholder="请输入用户名或手机号"
            />
            {errors.username ? (
              <p className="text-sm text-rose-600 dark:text-rose-300">{errors.username}</p>
            ) : null}
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              密码
            </span>
            <Input
              type="password"
              aria-invalid={Boolean(errors.password)}
              value={values.password}
              onChange={(event) => handleFieldChange("password", event.target.value)}
              placeholder="请输入登录密码"
            />
            {errors.password ? (
              <p className="text-sm text-rose-600 dark:text-rose-300">{errors.password}</p>
            ) : null}
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              安全校验码
            </span>
            <Input
              aria-invalid={Boolean(errors.key)}
              value={values.key}
              onChange={(event) => handleFieldChange("key", event.target.value)}
              placeholder="请输入安全校验码"
            />
            {errors.key ? (
              <p className="text-sm text-rose-600 dark:text-rose-300">{errors.key}</p>
            ) : null}
          </label>
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "登录中..." : "进入学习中心"}
          </Button>
          <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/80 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-slate-200">
            登录成功后会保留当前会话，并显示登录状态提示。
          </div>
          {feedback ? (
            <p
              role={feedback.tone === "error" ? "alert" : "status"}
              className={
                feedback.tone === "success"
                  ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                  : "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
              }
            >
              {feedback.message}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
