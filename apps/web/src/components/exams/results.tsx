"use client";

import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge, Button, EmptyState, Skeleton } from "@workspace/ui";
import { cn } from "@workspace/ui/lib/utils";
import { EXAM_STATUS, type ExamListItem } from "@/core/exams";

const getStatusPresentation = (status: ExamListItem["status"]) => {
  switch (status) {
    case EXAM_STATUS.IN_PROGRESS:
      return {
        railClassName: "bg-primary/70",
        statusClassName: "border border-primary/20 bg-primary/10 text-primary",
        metaClassName: "border-primary/15 bg-primary/[0.07]",
        label: "当前可进入",
      };
    case EXAM_STATUS.NOT_STARTED:
      return {
        railClassName: "bg-secondary-foreground/40",
        statusClassName:
          "border border-secondary/90 bg-secondary text-secondary-foreground",
        metaClassName: "border-border/80 bg-secondary/55",
        label: "等待开考",
      };
    case EXAM_STATUS.ENDED:
    default:
      return {
        railClassName: "bg-border",
        statusClassName: "border border-border bg-muted/75 text-muted-foreground",
        metaClassName: "border-border/80 bg-muted/45",
        label: "结果留档",
      };
  }
};

const ExamsLoadingState = () => {
  return (
    <MotionStagger
      className="grid gap-3"
      delayChildren={0.06}
      data-state="loading"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <MotionItem key={index}>
          <div className="overflow-hidden rounded-[30px] border border-border/80 bg-card/90">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.78fr)]">
              <div className="space-y-5 px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-8 w-2/3 rounded-full" />
                  <Skeleton className="h-5 w-full rounded-full" />
                  <Skeleton className="h-5 w-4/5 rounded-full" />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Skeleton className="h-20 rounded-[24px]" />
                  <Skeleton className="h-20 rounded-[24px]" />
                  <Skeleton className="h-20 rounded-[24px]" />
                </div>
              </div>
              <div className="border-t border-border/70 bg-muted/35 px-5 py-5 lg:border-t-0 lg:border-l sm:px-6">
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="mt-4 h-7 w-28 rounded-full" />
                <Skeleton className="mt-5 h-12 w-full rounded-[20px]" />
              </div>
            </div>
          </div>
        </MotionItem>
      ))}
    </MotionStagger>
  );
};

export const ExamsResults = ({
  items,
  loading,
  onOpen,
}: {
  items: ExamListItem[];
  loading: boolean;
  onOpen: (item: ExamListItem) => void;
}) => {
  if (loading) {
    return <ExamsLoadingState />;
  }

  if (!items.length) {
    return (
      <MotionReveal
        data-state="empty"
        className="rounded-[32px] border border-dashed border-border bg-card/85 px-6 py-14 shadow-sm"
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
      className="grid gap-3"
      delayChildren={0.08}
      data-testid="exam-results-section"
    >
      {items.map((item) => {
        const presentation = getStatusPresentation(item.status);

        return (
          <MotionItem key={item.id}>
            <article className="overflow-hidden rounded-[30px] border border-border/80 bg-card/90 shadow-sm">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.78fr)]">
                <div className="relative px-5 py-5 sm:px-6 sm:py-6">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-y-0 left-0 hidden w-1 lg:block",
                      presentation.railClassName
                    )}
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="bg-background/75">
                      {item.typeLabel}
                    </Badge>
                    <span
                      className={cn(
                        "inline-flex min-h-7 items-center rounded-full px-3 text-sm font-semibold tracking-[-0.01em]",
                        presentation.statusClassName
                      )}
                    >
                      {item.statusLabel}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-6">
                    <div className="grid gap-3">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                          {presentation.label}
                        </p>
                        <h3 className="max-w-[24ch] text-[1.625rem] font-semibold leading-[1.15] tracking-[-0.03em] text-foreground">
                          {item.title}
                        </h3>
                      </div>
                      <p className="max-w-[62ch] text-base leading-7 text-muted-foreground">
                        {item.summary}
                      </p>
                    </div>

                    <dl className="grid gap-3 sm:grid-cols-[minmax(0,1.25fr)_repeat(2,minmax(0,0.85fr))]">
                      <div
                        className={cn(
                          "grid gap-2 rounded-[24px] border px-4 py-4",
                          presentation.metaClassName
                        )}
                      >
                        <dt className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                          考试时间
                        </dt>
                        <dd className="text-base font-semibold leading-6 text-foreground">
                          {item.timeText}
                        </dd>
                      </div>
                      <div className="grid gap-2 rounded-[24px] border border-border/80 bg-background/65 px-4 py-4">
                        <dt className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                          当前状态
                        </dt>
                        <dd className="text-base font-semibold text-foreground">
                          {item.statusLabel}
                        </dd>
                      </div>
                      <div className="grid gap-2 rounded-[24px] border border-border/80 bg-background/65 px-4 py-4">
                        <dt className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                          参与情况
                        </dt>
                        <dd className="text-base font-semibold text-foreground">
                          {item.attendeeText}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-6 border-t border-border/70 bg-muted/30 px-5 py-5 sm:px-6 sm:py-6 lg:border-t-0 lg:border-l">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                        操作入口
                      </p>
                      <p className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                        {item.actionLabel}
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-border/80 bg-card/75 p-4">
                      <p className="text-sm leading-6 text-muted-foreground">
                        {item.status === EXAM_STATUS.IN_PROGRESS
                          ? "考试正在进行，优先进入以免错过当前作答窗口。"
                          : item.status === EXAM_STATUS.NOT_STARTED
                            ? "考试尚未开始，可先确认时间安排与参与范围。"
                            : "考试已结束，可进入查看详情或后续结果。"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Button
                      type="button"
                      variant={
                        item.status === EXAM_STATUS.ENDED
                          ? "outline"
                          : "default"
                      }
                      className="min-h-11 w-full justify-center rounded-[1.1rem] text-sm font-semibold"
                      disabled={!item.examId}
                      onClick={() => onOpen(item)}
                    >
                      {item.actionLabel}
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          </MotionItem>
        );
      })}
    </MotionStagger>
  );
};
