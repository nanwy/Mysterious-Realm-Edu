"use client";

import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
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
    <div className="rounded-[24px] border border-border/80 bg-card/90 p-5">
      <Skeleton className="h-5 w-28 rounded-full" />
      <Skeleton className="mt-3 h-4 w-48 rounded-full" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
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

  return (
    <SurfaceCard
      eyebrow="Profile"
      title="个人资料概览"
      description="沿用旧版个人信息页的信息层级，先承接资料展示和占位编辑入口。"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            {summary.avatarUrl ? <AvatarImage src={summary.avatarUrl} alt={summary.name} /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold text-foreground">{summary.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{summary.subtitle}</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{summary.secondaryLine}</p>
          </div>
        </div>

        <Button variant="outline" disabled>
          编辑功能建设中
        </Button>
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
              className="rounded-[20px] border border-border/70 bg-muted/30 p-4"
            >
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-base font-medium text-foreground">{item.value}</p>
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
        <SurfaceCard eyebrow="Profile" title="个人资料" description="当前无法完成资料展示。">
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
          description="聚合层已接通，但当前账号还没有可展示的资料内容。"
        >
          <div className="grid gap-4">
            <EmptyState
              title="暂无资料"
              description="学员基础资料、联系方式或部门信息暂未返回，页面已安全降级为占位状态。"
            />
            <Alert data-testid="profile-empty-alert">
              <AlertCircle className="size-4" />
              <AlertTitle>后续动作</AlertTitle>
              <AlertDescription>资料编辑入口暂不开放，本页当前只承接展示与状态反馈。</AlertDescription>
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
