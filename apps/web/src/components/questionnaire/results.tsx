"use client";

import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge, Button, Skeleton } from "@workspace/ui";
import {
  CircleAlert,
  CircleSlash,
  ClipboardList,
  RefreshCcw,
} from "lucide-react";
import type { QuestionnaireItem } from "@/core/questionnaire";

const LoadingState = () => (
  <div
    data-state="loading"
    className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.8fr)_minmax(0,0.85fr)]"
  >
    {Array.from({ length: 6 }, (_, index) => (
      <div
        key={index}
        className="rounded-[28px] border border-border bg-card/90 p-5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="grid flex-1 gap-3">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-7 w-3/4 rounded-full" />
          </div>
          <Skeleton className="size-12 rounded-2xl" />
        </div>
        <Skeleton className="mt-4 h-16 w-full rounded-2xl" />
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>
        <Skeleton className="mt-5 h-14 w-full rounded-2xl" />
      </div>
    ))}
  </div>
);

const EmptyStateView = ({ keyword }: { keyword: string }) => (
  <MotionReveal
    data-state="empty"
    className="rounded-[32px] border border-dashed border-border bg-card/85 px-6 py-12 text-center"
  >
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <CircleSlash className="size-6" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-foreground">当前没有可展示的问卷</p>
        <p className="text-sm leading-7 text-muted-foreground">
          {keyword
            ? `没有找到包含“${keyword}”的问卷，可以换一个关键词再试。`
            : "接口返回了空结果，后续接入新问卷后会自动展示在这里。"}
        </p>
      </div>
    </div>
  </MotionReveal>
);

const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <MotionReveal
    data-state="error"
    className="rounded-[32px] border border-border bg-card/90 px-6 py-10 shadow-sm"
  >
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <CircleAlert className="size-5" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-foreground">问卷列表暂时无法加载</p>
          <p className="text-sm leading-7 text-muted-foreground">{error}</p>
        </div>
      </div>
      <Button type="button" variant="outline" onClick={onRetry}>
        <RefreshCcw className="size-4" />
        重新加载
      </Button>
    </div>
  </MotionReveal>
);

export const Results = ({
  items,
  loading,
  error,
  keyword,
  onRetry,
}: {
  items: QuestionnaireItem[];
  loading: boolean;
  error: string | null;
  keyword: string;
  onRetry: () => void;
}) => {
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (!items.length) {
    return <EmptyStateView keyword={keyword} />;
  }

  return (
    <MotionStagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" delayChildren={0.08}>
      {items.map((item) => (
        <MotionItem key={item.id}>
          <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[30px] border border-border/80 bg-card/95 p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
            <div
              className="pointer-events-none absolute inset-x-5 top-0 h-24 rounded-b-[28px] bg-primary/6 blur-2xl transition duration-300 group-hover:bg-primary/10"
              aria-hidden="true"
            />
            <div className="relative space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{item.category}</Badge>
                    <Badge variant="outline">{item.status || "可参与"}</Badge>
                  </div>
                  <h3 className="line-clamp-2 text-xl font-semibold leading-tight text-foreground">
                    {item.title}
                  </h3>
                </div>
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-muted-foreground">
                  <ClipboardList className="size-5" />
                </div>
              </div>
              <p className="line-clamp-4 min-h-[7rem] text-sm leading-7 text-muted-foreground">
                {item.description}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-border/70 bg-background/80 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    题目数
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {item.questionCount} 题
                  </p>
                </div>
                <div className="rounded-[24px] border border-border/70 bg-background/80 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    答卷数
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {item.answerCount} 份
                  </p>
                </div>
              </div>
            </div>
            <div className="relative mt-5 flex items-center justify-between gap-3 rounded-[24px] border border-border/70 bg-background/70 px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">问卷任务</p>
                <p className="text-xs text-muted-foreground">
                  {item.updatedAt ? `最近同步 ${item.updatedAt}` : "已接入真实问卷列表接口"}
                </p>
              </div>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                Ready
              </span>
            </div>
          </article>
        </MotionItem>
      ))}
    </MotionStagger>
  );
};

