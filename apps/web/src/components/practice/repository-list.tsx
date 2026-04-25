"use client";

import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge, Button, Skeleton } from "@workspace/ui";
import { CircleAlert, CircleSlash, LibraryBig, RefreshCcw } from "lucide-react";
import type { PracticeRepositoryItem } from "@/core/practice";

const LoadingState = () => (
  <div
    data-state="loading"
    className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
  >
    {Array.from({ length: 6 }, (_, index) => (
      <div
        key={index}
        className="rounded-[28px] border border-border bg-card/90 p-5 shadow-sm"
      >
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="mt-4 h-7 w-2/3 rounded-full" />
        <Skeleton className="mt-3 h-20 w-full rounded-2xl" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
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
        <p className="text-lg font-semibold text-foreground">没有找到匹配的练习仓库</p>
        <p className="text-sm leading-7 text-muted-foreground">
          {keyword
            ? `当前关键字“${keyword}”没有匹配结果，可以换一个关键词再试。`
            : "当前接口返回空数据，后续题库接入后会自动显示在这里。"}
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
          <p className="text-lg font-semibold text-foreground">练习仓库暂时无法加载</p>
          <p className="text-sm leading-7 text-muted-foreground">{error}</p>
        </div>
      </div>
      <Button type="button" variant="outline" className="rounded-2xl" onClick={onRetry}>
        <RefreshCcw className="size-4" />
        重新加载
      </Button>
    </div>
  </MotionReveal>
);

export const RepositoryList = ({
  items,
  loading,
  error,
  keyword,
  onRetry,
}: {
  items: PracticeRepositoryItem[];
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
          <article className="group flex h-full flex-col justify-between gap-6 rounded-[28px] border border-border bg-card/95 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Badge className="rounded-full">题库仓库</Badge>
                {item.questionCount ? (
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.questionCount} 题
                  </span>
                ) : null}
              </div>
              <div className="space-y-2">
                <h3 className="line-clamp-2 text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="line-clamp-4 text-sm leading-7 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LibraryBig className="size-4" />
                <span>支持顺序练习 / 随机练习</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {item.updatedAt ? `更新于 ${item.updatedAt}` : "已接入真实接口"}
              </span>
            </div>
          </article>
        </MotionItem>
      ))}
    </MotionStagger>
  );
};

