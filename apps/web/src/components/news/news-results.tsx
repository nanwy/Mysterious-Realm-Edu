import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Button, EmptyState, Skeleton } from "@workspace/ui";
import { CircleAlert, RefreshCcw } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media";
import type { NewsListItem } from "./news-types";

function NewsLoadingState() {
  return (
    <div data-state="loading" className="grid gap-4">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="rounded-[28px] border border-border bg-card/90 p-5 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
            <Skeleton className="h-36 w-full rounded-[24px]" />
            <div className="grid gap-3">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-8 w-3/4 rounded-full" />
              <Skeleton className="h-20 w-full rounded-[24px]" />
              <Skeleton className="h-5 w-40 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function NewsErrorState({
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
            <p className="text-lg font-semibold text-foreground">资讯列表暂时无法加载</p>
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

function NewsEmptyState({ keyword }: { keyword: string }) {
  return (
    <MotionReveal data-state="empty" direction="up">
      <div className="rounded-[32px] border border-dashed border-border bg-card/85 px-6 py-12">
        <EmptyState
          title={keyword ? "没有匹配到资讯结果" : "暂无资讯数据"}
          description={
            keyword
              ? `当前关键词“${keyword}”没有命中资讯，可以更换关键词后重新搜索。`
              : "当前接口返回空列表，待资讯内容接入后会显示在这里。"
          }
        />
      </div>
    </MotionReveal>
  );
}

function NewsCover({ title, coverImg }: { title: string; coverImg: string | null }) {
  const mediaUrl = resolveMediaUrl(coverImg);

  if (mediaUrl) {
    return <img src={mediaUrl} alt={title} className="h-36 w-full rounded-[24px] object-cover" />;
  }

  return (
    <div className="flex h-36 items-end rounded-[24px] border border-border bg-muted/70 p-4">
      <div className="rounded-2xl bg-card/95 px-4 py-3 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">News</p>
        <p className="mt-2 text-sm text-foreground">等待封面资源</p>
      </div>
    </div>
  );
}

export function NewsResults({
  items,
  loading,
  error,
  keyword,
  onRetry,
}: {
  items: NewsListItem[];
  loading: boolean;
  error: string | null;
  keyword: string;
  onRetry: () => void;
}) {
  if (loading) {
    return <NewsLoadingState />;
  }

  if (error) {
    return <NewsErrorState error={error} onRetry={onRetry} />;
  }

  if (!items.length) {
    return <NewsEmptyState keyword={keyword} />;
  }

  return (
    <MotionStagger data-testid="news-results-section" className="grid gap-4" delayChildren={0.08}>
      {items.map((item) => (
        <MotionItem key={item.id}>
          <article className="overflow-hidden rounded-[28px] border border-border bg-card/95 p-5 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
              <a href={item.href} className="block">
                <NewsCover title={item.title} coverImg={item.coverImg} />
              </a>
              <div className="grid gap-4">
                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
                  <span>{item.publishTime}</span>
                  <span>{item.viewCountLabel}</span>
                </div>
                <div className="space-y-3">
                  <a href={item.href} className="block">
                    <h3 className="line-clamp-2 text-2xl font-semibold text-foreground">{item.title}</h3>
                  </a>
                  <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">{item.summary}</p>
                </div>
                <div>
                  <a
                    href={item.href}
                    className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
                  >
                    查看详情入口
                  </a>
                </div>
              </div>
            </div>
          </article>
        </MotionItem>
      ))}
    </MotionStagger>
  );
}
