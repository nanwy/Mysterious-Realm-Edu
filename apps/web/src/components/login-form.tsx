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
} from "@workspace/ui";

function extractToken(payload: unknown) {
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

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [key, setKey] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await login({ username, password, key });
        const payload = unwrapEnvelope(response);
        const token = extractToken(payload);

        if (token) {
          localStorage.setItem("token", token);
          setFeedback("登录接口已成功返回，并已写入本地 token。");
          return;
        }

        setFeedback("登录接口已返回成功结果，但暂未识别到 token 字段。");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "登录失败");
      }
    });
  }

  return (
    <Card className="border-white/80 bg-white/90 shadow-[0_32px_90px_rgba(15,23,42,0.1)]">
      <CardHeader>
        <Badge variant="secondary">Real API</Badge>
        <CardTitle>登录表单</CardTitle>
        <CardDescription>
          已接入旧项目 `/auth/login` 接口。验证码 key 先保留为手动输入，下一步再补图片验证码读取。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="用户名 / 手机号"
          />
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="密码"
          />
          <Input
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder="验证码 Key（首期手动输入）"
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "登录中..." : "登录并测试真实接口"}
          </Button>
          {feedback ? (
            <p className="text-sm leading-6 text-slate-600">{feedback}</p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
