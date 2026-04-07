"use client";

import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  EmptyState,
  Skeleton,
  SurfaceCard,
} from "@workspace/ui";
import { AlertCircle, Building2, Mail, ShieldAlert, UserRound } from "lucide-react";

type ProfilePageState = "loading" | "empty" | "error" | "ready";

interface ProfileField {
  label: string;
  value: string;
}

interface ProfileShellSection {
  title: string;
  description: string;
  testId: string;
  items: ProfileField[];
}

interface ProfileShellSummary {
  name: string;
  subtitle: string;
  secondaryLine: string;
  avatarUrl: string | null;
}

type ErrorType = "config_missing" | "unauthorized" | "request_failed";

export interface ProfilePageShellProps {
  state: ProfilePageState;
  summary?: ProfileShellSummary;
  sections?: ProfileShellSection[];
  errorType?: ErrorType;
  errorMessage?: string | null;
}

const SECTION_ICONS = [UserRound, Mail, Building2] as const;

function LoadingCard() {
  return (
    <div className="rounded-[24px] border border-border/80 bg-card/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <Skeleton className="h-5 w-28 rounded-full" />
      <Skeleton className="mt-3 h-4 w-48 rounded-full" />
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-[20px] border border-border/70 bg-background/70 p-4">
            <Skeleton className="h-3 w-16 rounded-full" />
            <Skeleton className="mt-3 h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-[20px] border border-border/70 bg-muted/30 p-4">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="mt-3 h-5 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function getErrorCopy(errorType: ErrorType, errorMessage?: string | null) {
  switch (errorType) {
    case "config_missing":
      return {
        title: "环境未配置",
        description: errorMessage ?? "缺少 NEXT_PUBLIC_API_BASE_URL，当前是环境配置问题。",
      };
    case "unauthorized":
      return {
        title: "未登录或暂无权限",
        description:
          errorMessage ?? "当前账号未登录或没有查看个人资料的权限，请确认登录状态后重试。",
      };
    case "request_failed":
    default:
      return {
        title: "资料读取失败",
        description: errorMessage ?? "个人资料接口请求失败，请稍后刷新页面重试。",
      };
  }
}

function ProfileSummary({ summary }: { summary: ProfileShellSummary }) {
  const initials = summary.name.trim().slice(0, 1) || "U";
  const summaryHighlights = [
    { label: "当前部门", value: summary.subtitle },
    { label: "账号标识", value: summary.secondaryLine.replace(/^账号标识：/, "") },
    { label: "资料模式", value: "只读展示" },
  ];

  return (
    <SurfaceCard
      eyebrow="Profile"
      title="个人资料概览"
      description="统一收束身份摘要、组织信息与资料状态，保持清晰稳定的只读信息层级。"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:items-start">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar size="lg">
            {summary.avatarUrl ? <AvatarImage src={summary.avatarUrl} alt={summary.name} /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="min-w-0 break-words text-2xl font-semibold text-foreground">
                {summary.name}
              </h2>
              <Badge variant="outline">资料只读</Badge>
            </div>
            <p className="mt-2 break-words text-sm text-muted-foreground">{summary.subtitle}</p>
            <p className="mt-3 break-all text-sm leading-7 text-muted-foreground">
              {summary.secondaryLine}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              本页聚合学员基础资料、联系渠道与组织归属，字段缺失时统一以安全降级文案呈现。
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          {summaryHighlights.map((item) => (
            <div
              key={item.label}
              className="rounded-[20px] border border-border/70 bg-muted/35 p-4"
            >
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-3 break-words text-sm font-medium leading-6 text-foreground">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SurfaceCard>
  );
}

function InfoSection({
  section,
  icon: Icon,
}: {
  section: ProfileShellSection;
  icon: (typeof SECTION_ICONS)[number];
}) {
  return (
    <SurfaceCard
      title={section.title}
      description={section.description}
    >
      <div className="grid gap-4" data-testid={section.testId}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="size-4" />
          <span>{section.title}</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {section.items.map((item) => (
            <div
              key={`${section.testId}-${item.label}`}
              className="min-w-0 rounded-[20px] border border-border/70 bg-muted/30 p-4"
            >
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-2 whitespace-pre-line break-words text-base font-medium leading-7 text-foreground">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SurfaceCard>
  );
}

export function ProfilePageShell({
  state,
  summary,
  sections = [],
  errorType,
  errorMessage,
}: ProfilePageShellProps) {
  if (state === "loading") {
    return (
      <div className="grid gap-6" data-testid="profile-loading">
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
        <SurfaceCard
          eyebrow="Profile"
          title="个人资料"
          description="资料聚合已中断，当前切换为统一错误说明态。"
        >
          <Alert variant="destructive" data-testid={`profile-error-${errorType}`}>
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
          eyebrow="Profile"
          title="个人资料"
          description="当前账号暂无可展示的资料内容，页面保留统一空状态结构。"
        >
          <div className="grid gap-4">
            <EmptyState
              title="暂无资料"
              description="学员基础资料、联系方式或部门信息暂未返回，页面已安全降级并保留稳定版式。"
            />
            <Alert data-testid="profile-empty-alert">
              <AlertCircle className="size-4" />
              <AlertTitle>当前说明</AlertTitle>
              <AlertDescription>
                本页仅展示已返回资料，不渲染占位型操作入口，避免误导为可编辑状态。
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
        <ProfileSummary summary={summary} />
      </MotionReveal>

      <MotionStagger className="grid gap-6 xl:grid-cols-3" delayChildren={0.06}>
        {sections.map((section, index) => {
          const Icon = SECTION_ICONS[index] ?? UserRound;

          return (
            <MotionItem key={section.testId}>
              <InfoSection section={section} icon={Icon} />
            </MotionItem>
          );
        })}
      </MotionStagger>
    </div>
  );
}
