"use client";

import { Badge, Button, EmptyState, Skeleton } from "@workspace/ui";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import type { ExamListItem } from "./exams-types";

function ExamsLoadingState() {
  return (
    <MotionStagger
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      delayChildren={0.06}
      data-state="loading"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <MotionItem key={index}>
          <div className="rounded-[28px] border border-border bg-card/90 p-5 shadow-sm">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="mt-4 h-7 w-2/3 rounded-full" />
            <Skeleton className="mt-4 h-20 w-full rounded-3xl" />
            <Skeleton className="mt-5 h-10 w-full rounded-2xl" />
          </div>
        </MotionItem>
      ))}
    </MotionStagger>
  );
}

export function ExamsResults({
  items,
  loading,
  error,
  onRetry,
  onOpen,
}: {
  items: ExamListItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpen: (item: ExamListItem) => void;
}) {
  if (loading) {
    return <ExamsLoadingState />;
  }

  if (error) {
    return (
      <MotionReveal
        data-state="error"
        className="rounded-[32px] border border-destructive/30 bg-card/90 px-6 py-10 shadow-sm"
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">考试列表暂时不可用</h3>
            <p className="text-sm leading-7 text-muted-foreground">{error}</p>
          </div>
          <div>
            <Button type="button" variant="outline" onClick={onRetry}>
              重新加载
            </Button>
          </div>
        </div>
      </MotionReveal>
    );
  }

  if (!items.length) {
    return (
      <MotionReveal
        data-state="empty"
        className="rounded-[32px] border border-dashed border-border bg-card/80 px-6 py-14 shadow-sm"
      >
        <EmptyState
          title="暂无符合条件的考试"
          description="可以切换考试类型、状态，或清空关键词后重新查询。"
        />
      </MotionReveal>
    );
  }

  return (
    <MotionStagger
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      delayChildren={0.08}
      data-testid="exams-results-section"
    >
      {items.map((item) => (
        <MotionItem key={item.id}>
          <article className="flex h-full flex-col rounded-[28px] border border-border bg-card/90 p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{item.typeLabel}</Badge>
              <Badge>{item.statusLabel}</Badge>
            </div>

            <div className="mt-4 space-y-3">
              <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm leading-7 text-muted-foreground">{item.summary}</p>
            </div>

            <dl className="mt-5 grid gap-3 rounded-[24px] border border-border bg-muted/30 p-4 text-sm">
              <div className="grid gap-1">
                <dt className="text-muted-foreground">考试时间</dt>
                <dd className="font-medium text-foreground">{item.timeText}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">状态</dt>
                <dd className="font-medium text-foreground">{item.statusLabel}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">参与情况</dt>
                <dd className="font-medium text-foreground">{item.attendeeText}</dd>
              </div>
            </dl>

            <div className="mt-5 flex-1" />

            <div>
              <Button
                type="button"
                variant={item.status === "3" ? "outline" : "default"}
                disabled={!item.examId}
                onClick={() => onOpen(item)}
              >
                {item.actionLabel}
              </Button>
            </div>
          </article>
        </MotionItem>
      ))}
    </MotionStagger>
  );
}
