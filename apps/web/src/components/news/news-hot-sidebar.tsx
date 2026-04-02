import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import type { NewsListItem } from "./news-types";

export function NewsHotSidebar({
  items,
  error,
}: {
  items: NewsListItem[];
  error: string | null;
}) {
  const visibleItems = items.length
    ? items
    : Array.from({ length: 5 }, (_, index) => ({
        id: `hot-placeholder-${index + 1}`,
        title: `热点资讯 ${index + 1}`,
        summary: "热点资讯暂未返回。",
        publishTime: "等待接口返回",
        coverImg: null,
        viewCountLabel: "热度待同步",
        href: "#",
      }));

  return (
    <MotionReveal direction="left">
      <aside
        data-testid="news-hot-sidebar"
        className="rounded-[32px] border border-border bg-card/95 p-5 shadow-sm"
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            热榜侧栏
          </p>
          <h2 className="text-xl font-semibold text-foreground">热点追踪</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            保留旧版右侧热榜结构，集中展示热门资讯与时间信息。
          </p>
          {error ? <p className="text-sm leading-6 text-destructive">{error}</p> : null}
        </div>

        <MotionStagger className="mt-5 grid gap-3" delayChildren={0.06}>
          {visibleItems.map((item, index) => (
            <MotionItem key={item.id}>
              <a
                href={item.href}
                className="flex items-start gap-4 rounded-[22px] border border-border bg-background/70 px-4 py-3 transition-colors hover:border-primary/35"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-muted text-sm font-semibold text-foreground">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold text-foreground">{item.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.publishTime}</span>
                    <span>{item.viewCountLabel}</span>
                  </div>
                </div>
              </a>
            </MotionItem>
          ))}
        </MotionStagger>
      </aside>
    </MotionReveal>
  );
}
