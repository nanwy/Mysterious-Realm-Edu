import { MotionItem, MotionStagger } from "@workspace/motion";
import { resolveMediaUrl, toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";
import { ErrorLine, HomeSection } from "./home-section-heading";
import { ArrowUpRight, Newspaper } from "lucide-react";

export function HomeNewsSection({
  recommendedNews,
  recommendedNewsError,
}: {
  recommendedNews: HomeRecord[];
  recommendedNewsError: string | null;
}) {
  const visibleRecommended = (
    recommendedNews.length ? recommendedNews : new Array(4).fill({})
  ).slice(0, 4);

  return (
    <HomeSection
      eyebrow="Editorial Feed"
      title="精选资讯"
      subtitle="把平台资讯组织成更像编辑流的内容面板，让推荐内容成为门户的一层，而不是传统文章卡片。"
      href="/news"
    >
      <ErrorLine message={recommendedNewsError} />
      <MotionStagger className="grid gap-5" delayChildren={0.1}>
        {visibleRecommended[0] ? (
          <MotionItem>
            <FeaturedNewsCard item={visibleRecommended[0]} />
          </MotionItem>
        ) : null}

        <div className="grid gap-5 md:grid-cols-3">
          {visibleRecommended.slice(1, 4).map((item, index) => (
            <MotionItem key={index}>
              <CompactNewsCard item={item} index={index + 2} />
            </MotionItem>
          ))}
        </div>
      </MotionStagger>
    </HomeSection>
  );
}

function FeaturedNewsCard({ item }: { item: HomeRecord }) {
  const cover = resolveMediaUrl(String(item.coverImg ?? ""));

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-border/80 bg-card shadow-[0_16px_42px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_24px_58px_rgba(15,23,42,0.1)]">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.08fr)_420px]">
        <div className="flex flex-col justify-between px-6 py-6">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                Lead Story
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-primary" />
            </div>
            <h3 className="mt-4 max-w-3xl text-[clamp(2rem,3.8vw,3.3rem)] font-black leading-[0.95] tracking-[-0.06em] text-foreground transition-colors group-hover:text-primary">
              {toText(item.title, "今日精选资讯")}
            </h3>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-8 text-muted-foreground md:text-base">
              {toText(item.remark ?? item.summary, "推荐内容会在这里承接旧系统文章摘要，并作为平台内容流的第一焦点。")}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-border/70 bg-muted px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Platform Feed
            </div>
            <div className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
              推荐内容优先展示
            </div>
          </div>
        </div>

        <div className="overflow-hidden border-t border-border/60 bg-[linear-gradient(180deg,var(--muted),rgba(255,255,255,0.74))] p-4 lg:border-l lg:border-t-0">
          {cover ? (
            <img
              src={cover}
              alt={toText(item.title, "资讯封面")}
              className="h-full min-h-[320px] w-full rounded-[1.2rem] object-cover"
            />
          ) : (
            <div className="grid h-full min-h-[320px] place-items-center rounded-[1.2rem] border border-border/60 bg-card">
              <div className="space-y-3 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Newspaper className="size-5" />
                </div>
                <div className="text-sm font-bold text-foreground">平台资讯主内容</div>
                <div className="text-xs font-medium text-muted-foreground">
                  主资讯会在这里承接真实封面与摘要
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function CompactNewsCard({
  item,
  index,
}: {
  item: HomeRecord;
  index: number;
}) {
  const cover = resolveMediaUrl(String(item.coverImg ?? ""));

  return (
    <article className="group overflow-hidden rounded-[1.35rem] border border-border/80 bg-card shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Feed {index}
        </div>
        <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-primary" />
      </div>

      <div className="overflow-hidden bg-[linear-gradient(180deg,var(--muted),rgba(255,255,255,0.78))] p-3">
        {cover ? (
          <img
            src={cover}
            alt={toText(item.title, `资讯 ${index}`)}
            className="h-40 w-full rounded-[1rem] object-cover"
          />
        ) : (
          <div className="grid h-40 place-items-center rounded-[1rem] border border-border/60 bg-card">
            <div className="space-y-2 text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Newspaper className="size-4" />
              </div>
              <div className="text-xs font-bold text-foreground">内容卡片</div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 px-4 py-4">
        <h3 className="line-clamp-2 text-xl font-black tracking-[-0.04em] text-foreground transition-colors group-hover:text-primary">
          {toText(item.title, `推荐资讯 ${index}`)}
        </h3>
        <p className="line-clamp-3 text-sm font-medium leading-7 text-muted-foreground">
          {toText(item.remark ?? item.summary, "推荐资讯会在这里承接旧系统文章摘要。")}
        </p>
      </div>
    </article>
  );
}
