import Link from "next/link";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge, Button, Skeleton } from "@workspace/ui";
import { BookOpenText, CircleAlert, CircleSlash, RefreshCcw } from "lucide-react";
import type { CourseListItem } from "./courses-types";

function getProgressValue(progressLabel: string) {
  const matched = progressLabel.match(/(\d+)/);
  if (!matched) {
    return 0;
  }

  return Math.max(0, Math.min(100, Number(matched[1])));
}

function CoursesLoadingState() {
  return (
    <div data-state="loading" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="rounded-[28px] border border-border bg-card/90 p-5 shadow-sm">
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
    <MotionStagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" delayChildren={0.08}>
      {items.map((item) => (
        <MotionItem key={item.id}>
          <article className="group flex h-full flex-col justify-between gap-5 rounded-[28px] border border-border bg-card/95 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
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
                <Badge className="rounded-full">{item.statusLabel}</Badge>
              </div>

              <div className="space-y-2">
                <h3 className="line-clamp-2 text-xl font-semibold tracking-tight text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.teacherName}</p>
              </div>

              <div className="space-y-3 rounded-[24px] border border-border/70 bg-background/70 p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
                    <span>学习进度</span>
                    <span className="font-medium text-foreground">{item.progressLabel}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-primary/10">
                    <div
                      className="h-full rounded-full bg-primary transition-[width]"
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

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpenText className="size-4" />
                <span>{item.statusLabel === "可开始" ? "支持立即进入课程" : "优先回到上次学习位置"}</span>
              </div>
              <Link
                href={`/courses/${item.id}`}
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                进入课程
              </Link>
            </div>
          </article>
        </MotionItem>
      ))}
    </MotionStagger>
  );
}
