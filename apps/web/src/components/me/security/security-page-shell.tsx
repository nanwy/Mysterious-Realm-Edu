"use client";

import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  EmptyState,
  Skeleton,
  SurfaceCard,
} from "@workspace/ui";
import { AlertCircle, KeyRound, Mail, ShieldAlert, Smartphone } from "lucide-react";

type SecurityPageState = "loading" | "empty" | "error" | "ready";
type ErrorType = "config_missing" | "unauthorized" | "request_failed";

interface SecuritySection {
  title: string;
  description: string;
  testId: string;
  value: string;
  status: string;
  helper: string;
}

interface SecuritySummary {
  title: string;
  description: string;
  detail: string;
}

export interface SecurityPageShellProps {
  state: SecurityPageState;
  summary?: SecuritySummary;
  sections?: SecuritySection[];
  errorType?: ErrorType;
  errorMessage?: string | null;
}

const SECTION_ICONS = [Smartphone, Mail, KeyRound] as const;

function LoadingCard() {
  return (
    <div className="rounded-[24px] border border-border/80 bg-card/90 p-5">
      <Skeleton className="h-5 w-28 rounded-full" />
      <Skeleton className="mt-3 h-4 w-40 rounded-full" />
      <Skeleton className="mt-6 h-16 w-full rounded-[20px]" />
      <Skeleton className="mt-4 h-10 w-28 rounded-full" />
    </div>
  );
}

function getErrorCopy(errorType: ErrorType, errorMessage?: string | null) {
  switch (errorType) {
    case "config_missing":
      return {
        title: "环境配置缺失",
        description:
          errorMessage ?? "缺少 NEXT_PUBLIC_API_BASE_URL，当前是环境配置问题，账号安全页已降级为说明态。",
      };
    case "unauthorized":
      return {
        title: "未登录或暂无权限",
        description:
          errorMessage ?? "当前账号未登录或没有查看账号安全信息的权限，请先确认登录状态。",
      };
    case "request_failed":
    default:
      return {
        title: "账号安全信息读取失败",
        description: errorMessage ?? "资料接口请求失败，请稍后刷新页面重试。",
      };
  }
}

function SecuritySummaryCard({ summary }: { summary: SecuritySummary }) {
  return (
    <SurfaceCard
      eyebrow="Security"
      title="账号安全概览"
      description="先承接旧版账户安全的信息层级，保留后续修改入口位置，但本页不开放真实提交。"
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="grid gap-3">
          <div>
            <p className="text-sm text-muted-foreground">当前账号</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">{summary.title}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{summary.description}</p>
          <p className="text-sm leading-7 text-muted-foreground">{summary.detail}</p>
        </div>

        <Button variant="outline" disabled>
          修改功能建设中
        </Button>
      </div>
    </SurfaceCard>
  );
}

function SecuritySectionCard({
  section,
  icon: Icon,
}: {
  section: SecuritySection;
  icon: (typeof SECTION_ICONS)[number];
}) {
  return (
    <SurfaceCard title={section.title} description={section.description}>
      <div className="grid gap-4" data-testid={section.testId}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="size-4" />
          <span>{section.status}</span>
        </div>

        <div className="rounded-[20px] border border-border/70 bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">当前信息</p>
          <p className="mt-2 text-base font-medium text-foreground">{section.value}</p>
        </div>

        <p className="text-sm leading-7 text-muted-foreground">{section.helper}</p>

        <div>
          <Button variant="outline" disabled>
            暂不支持修改
          </Button>
        </div>
      </div>
    </SurfaceCard>
  );
}

export function SecurityPageShell({
  state,
  summary,
  sections = [],
  errorType,
  errorMessage,
}: SecurityPageShellProps) {
  if (state === "loading") {
    return (
      <div className="grid gap-6" data-testid="security-loading">
        <MotionReveal direction="up">
          <LoadingCard />
        </MotionReveal>
        <MotionStagger className="grid gap-6 xl:grid-cols-3" delayChildren={0.06}>
          {Array.from({ length: 3 }).map((_, index) => (
            <MotionItem key={index}>
              <LoadingCard />
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    );
  }

  if (state === "error" && errorType) {
    const copy = getErrorCopy(errorType, errorMessage);

    return (
      <MotionReveal direction="up">
        <SurfaceCard eyebrow="Security" title="账号安全" description="当前无法展示账号安全概览。">
          <Alert variant="destructive" data-testid={`security-error-${errorType}`}>
            <ShieldAlert className="size-4" />
            <AlertTitle>{copy.title}</AlertTitle>
            <AlertDescription>{copy.description}</AlertDescription>
          </Alert>
        </SurfaceCard>
      </MotionReveal>
    );
  }

  if (state === "empty") {
    return (
      <MotionReveal direction="up">
        <SurfaceCard
          eyebrow="Security"
          title="账号安全"
          description="当前账号暂无可展示的安全资料，页面已安全降级。"
        >
          <div className="grid gap-4">
            <EmptyState
              title="暂无安全资料"
              description="手机号、邮箱或账号标识尚未返回，本页暂时只保留后续安全能力的承接位置。"
            />
            <Alert data-testid="security-empty-alert">
              <AlertCircle className="size-4" />
              <AlertTitle>后续动作</AlertTitle>
              <AlertDescription>
                当前 issue 仅承接只读安全概览，所有修改入口都保持禁用，不伪造可提交表单。
              </AlertDescription>
            </Alert>
          </div>
        </SurfaceCard>
      </MotionReveal>
    );
  }

  if (!summary || sections.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-6">
      <MotionReveal direction="up">
        <SecuritySummaryCard summary={summary} />
      </MotionReveal>

      <MotionStagger className="grid gap-6 xl:grid-cols-3" delayChildren={0.06}>
        {sections.map((section, index) => {
          const Icon = SECTION_ICONS[index] ?? KeyRound;

          return (
            <MotionItem key={section.testId}>
              <SecuritySectionCard section={section} icon={Icon} />
            </MotionItem>
          );
        })}
      </MotionStagger>
    </div>
  );
}
