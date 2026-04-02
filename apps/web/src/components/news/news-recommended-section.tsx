import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { resolveMediaUrl } from "@/lib/media";
import type { NewsSectionCard } from "./news-types";

function NewsCover({
  title,
  coverImg,
}: {
  title: string;
  coverImg: string | null;
}) {
  const mediaUrl = resolveMediaUrl(coverImg);

  if (mediaUrl) {
    return <img src={mediaUrl} alt={title} className="h-44 w-full object-cover" />;
  }

  return (
    <div className="flex h-44 items-end bg-[linear-gradient(135deg,hsl(var(--muted)),hsl(var(--card))_72%)] p-5">
      <div className="rounded-2xl border border-border/70 bg-card/95 px-4 py-3 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">News</p>
        <p className="mt-2 text-sm text-foreground">资讯封面待接入</p>
      </div>
    </div>
  );
}

export function NewsRecommendedSection({
  items,
  error,
}: {
  items: NewsSectionCard[];
  error: string | null;
}) {
  const visibleItems = items.length
    ? items
    : Array.from({ length: 4 }, (_, index) => ({
        id: `recommended-placeholder-${index + 1}`,
        title: `推荐资讯 ${index + 1}`,
        summary: "推荐资讯暂未返回，待接口恢复后这里会展示真实内容。",
        publishTime: "等待接口返回",
        coverImg: null,
        viewCountLabel: "热度待同步",
        href: "#",
        eyebrow: "推荐资讯",
      }));

  return (
    <MotionReveal direction="up">
      <section data-testid="news-recommended-section" className="grid gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            推荐区
          </p>
          <h2 className="text-2xl font-semibold text-foreground">首页资讯入口承接页</h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            沿用旧版 4 宫格推荐区，优先展示推荐资讯并保留进入详情的占位入口。
          </p>
          {error ? <p className="text-sm leading-6 text-destructive">{error}</p> : null}
        </div>

        <MotionStagger className="grid gap-4 sm:grid-cols-2" delayChildren={0.08}>
          {visibleItems.map((item) => (
            <MotionItem key={item.id}>
              <a
                href={item.href}
                className="group block overflow-hidden rounded-[28px] border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <NewsCover title={item.title} coverImg={item.coverImg} />
                <div className="grid gap-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {item.eyebrow}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.publishTime}</p>
                  </div>
                  <h3 className="line-clamp-2 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                </div>
              </a>
            </MotionItem>
          ))}
        </MotionStagger>
      </section>
    </MotionReveal>
  );
}
