import Link from "next/link";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Button, Skeleton } from "@workspace/ui";
import { ArrowUpRight, BookOpenText, CircleAlert, CircleSlash, Clock3, RefreshCcw, Sparkles } from "lucide-react";
import type { CourseListItem } from "./courses-types";

function getProgressValue(progressLabel: string) {
  const matched = progressLabel.match(/(\d+)/);
  if (!matched) {
    return 0;
  }

  return Math.max(0, Math.min(100, Number(matched[1])));
}

function getProgressTone(progress: number) {
  if (progress >= 80) {
    return "bg-emerald-500";
  }

  if (progress >= 40) {
    return "bg-primary";
  }

  return "bg-amber-500";
}

function getStatusTone(statusLabel: string) {
  if (statusLabel.includes("完成")) {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (statusLabel.includes("学习")) {
    return "border-primary/20 bg-primary/10 text-primary";
  }

  return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300";
}

function CoursesLoadingState() {
  return (
    <div data-state="loading" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="rounded-[30px] border border-border bg-card/90 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="size-12 rounded-2xl" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-7 w-2/3 rounded-full" />
          <Skeleton className="mt-3 h-4 w-1/2 rounded-full" />
          <Skeleton className="mt-5 h-2.5 w-full rounded-full" />
          <Skeleton className="mt-5 h-24 w-full rounded-2xl" />
          <div className="mt-4 grid gap-2">
            <Skeleton className="h-10 w-full rounded-2xl" />
            <Skeleton className="h-10 w-full rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CoursesEmptyState({ keyword }: { keyword?: string }) {
  return (
    <MotionReveal
      data-state="empty"
      className="rounded-[32px] border border-dashed border-border bg-card/85 px-6 py-12 text-center"
    >
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <CircleSlash className="size-6" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-foreground">暂无匹配课程</p>
          <p className="text-sm leading-7 text-muted-foreground">
            {keyword
              ? `当前关键词“${keyword}”没有匹配结果，建议清空筛选后重新浏览。`
              : "当前接口返回空数据，课程接入完成后会自动显示在这里。"}
          </p>
          <p className="text-sm leading-7 text-muted-foreground">
            如果你只是想继续最近的学习，优先清空分类和排序条件，保留关键词即可更快定位目标。
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-sm text-muted-foreground">
            建议切回全部分类
          </span>
          <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-sm text-muted-foreground">
            保留一个最强关键词
          </span>
        </div>
      </div>
    </MotionReveal>
  );
}

function CoursesErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <MotionReveal data-state="error" className="rounded-[32px] border border-border bg-card/90 px-6 py-10 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <CircleAlert className="size-5" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">课程接口暂时无法加载</p>
            <p className="text-sm leading-7 text-muted-foreground">
              当前无法读取课程列表：{error}。请确认已登录且接口环境可访问后重试。
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" className="rounded-2xl" onClick={onRetry}>
          <RefreshCcw className="size-4" />
          重新加载
        </Button>
      </div>
    </MotionReveal>
  );
}

export function CoursesResults({
  items,
  loading,
  error,
  keyword,
  onRetry,
}: {
  items: CourseListItem[];
  loading: boolean;
  error: string | null;
  keyword?: string;
  onRetry: () => void;
}) {
  if (loading) {
    return <CoursesLoadingState />;
  }

  if (error) {
    return <CoursesErrorState error={error} onRetry={onRetry} />;
  }

  if (!items.length) {
    return <CoursesEmptyState keyword={keyword} />;
  }

  return (
    <MotionStagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" delayChildren={0.08} data-testid="courses-results-grid">
      {items.map((item) => (
        <MotionItem key={item.id}>
          <article className="group flex h-full flex-col justify-between gap-5 rounded-[30px] border border-border bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_92%,white_8%),color-mix(in_oklab,var(--background)_84%,var(--card)_16%))] p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                    {item.coverLabel}
                  </div>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    {item.categoryName}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(
                    item.statusLabel
                  )}`}
                >
                  {item.statusLabel}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="line-clamp-2 text-xl font-semibold tracking-tight text-foreground">{item.title}</h3>
                <p className="line-clamp-1 text-sm text-muted-foreground">{item.teacherName}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-border/70 bg-background/72 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    学习节奏
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <p className="text-base font-semibold text-foreground">{item.progressLabel}</p>
                    <Sparkles className="size-4 text-primary" />
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary/10">
                    <div
                      className={`h-full rounded-full transition-[width] ${getProgressTone(
                        getProgressValue(item.progressLabel)
                      )}`}
                      style={{ width: `${getProgressValue(item.progressLabel)}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-[22px] border border-border/70 bg-background/72 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    进入判断
                  </p>
                  <p className="mt-3 text-base font-semibold text-foreground">
                    {item.statusLabel === "可开始" ? "适合直接开始学习" : "优先续接上次进度"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.statusLabel === "可开始"
                      ? "适合在当前页确认信息后直接进入，不必再反复跳转。"
                      : "当前更适合沿着原学习节奏继续，减少重复寻找章节的成本。"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-[24px] border border-border/70 bg-background/70 p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
                    <span>学习进度</span>
                    <span className="font-medium text-foreground">{item.progressLabel}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-primary/10">
                    <div
                      className={`h-full rounded-full transition-[width] ${getProgressTone(
                        getProgressValue(item.progressLabel)
                      )}`}
                      style={{ width: `${getProgressValue(item.progressLabel)}%` }}
                    />
                  </div>
                </div>

                <div className="grid gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between gap-4">
                    <span>课程分类</span>
                    <span className="font-medium text-foreground">{item.categoryName}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>课程价格</span>
                    <span className="font-medium text-foreground">{item.priceLabel}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>内容规模</span>
                    <span className="font-medium text-foreground">{item.lessonCountLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <BookOpenText className="size-4" />
                  <span>{item.statusLabel === "可开始" ? "支持立即进入课程" : "优先回到上次学习位置"}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="size-4" />
                  <span>{item.lessonCountLabel}</span>
                </span>
              </div>
              <Link
                href={`/courses/${item.id}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                进入课程
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </article>
        </MotionItem>
      ))}
    </MotionStagger>
  );
}
