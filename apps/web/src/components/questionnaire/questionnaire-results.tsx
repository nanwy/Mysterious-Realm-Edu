import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge, Button, Skeleton } from "@workspace/ui";
import { CircleAlert, CircleSlash, ClipboardList, RefreshCcw } from "lucide-react";
import type { QuestionnaireItem } from "./questionnaire-types";

function QuestionnaireLoadingState() {
  return (
    <div
      data-state="loading"
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="rounded-[28px] border border-border bg-card/90 p-5 shadow-sm"
        >
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="mt-4 h-7 w-2/3 rounded-full" />
          <Skeleton className="mt-3 h-16 w-full rounded-2xl" />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Skeleton className="h-10 rounded-2xl" />
            <Skeleton className="h-10 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function QuestionnaireEmptyState({ keyword }: { keyword: string }) {
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
}

function QuestionnaireErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
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
}

export function QuestionnaireResults({
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
}) {
  if (loading) {
    return <QuestionnaireLoadingState />;
  }

  if (error) {
    return <QuestionnaireErrorState error={error} onRetry={onRetry} />;
  }

  if (!items.length) {
    return <QuestionnaireEmptyState keyword={keyword} />;
  }

  return (
    <MotionStagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" delayChildren={0.08}>
      {items.map((item) => (
        <MotionItem key={item.id}>
          <article className="flex h-full flex-col justify-between gap-5 rounded-[28px] border border-border bg-card/95 p-5 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <Badge>{item.category}</Badge>
                  <h3 className="line-clamp-2 text-xl font-semibold text-foreground">
                    {item.title}
                  </h3>
                </div>
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <ClipboardList className="size-5" />
                </div>
              </div>
              <p className="line-clamp-4 text-sm leading-7 text-muted-foreground">
                {item.description}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    题目数
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {item.questionCount} 题
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    答卷数
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {item.answerCount} 份
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {item.status || "可参与"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.updatedAt ? `更新时间 ${item.updatedAt}` : "已接入真实问卷列表接口"}
                </p>
              </div>
              <Badge variant="outline">问卷任务</Badge>
            </div>
          </article>
        </MotionItem>
      ))}
    </MotionStagger>
  );
}
