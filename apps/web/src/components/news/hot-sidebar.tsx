"use client";

import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import type { NewsListItem } from "@/core/news";

export const HotSidebar = ({
  items,
  error,
}: {
  items: NewsListItem[];
  error: string | null;
}) => {
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
        className="rounded-[32px] border border-border bg-card/95 p-5 shadow-sm xl:sticky xl:top-24 xl:self-start"
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            热榜侧栏
          </p>
          <h2 className="text-xl font-semibold text-foreground">热点追踪</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            热榜继续放在右侧，但现在承担“快速切换阅读目标”的作用，而不只是附属展示。
          </p>
          {error ? <p className="text-sm leading-6 text-destructive">{error}</p> : null}
        </div>

        <MotionStagger className="mt-5 grid gap-3" delayChildren={0.06}>
          {visibleItems.map((item, index) => (
            <MotionItem key={item.id}>
              <a
                href={item.href}
                className={`flex items-start gap-4 rounded-[22px] border px-4 py-3 transition-colors hover:border-primary/35 ${
                  index === 0
                    ? "border-primary/20 bg-[linear-gradient(135deg,hsl(var(--primary)/0.12),hsl(var(--background))_72%)]"
                    : "border-border bg-background/70"
                }`}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
                    index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
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
};

