"use client";

import type { NewsArticle } from "@workspace/api";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import Image from "next/image";
import { formatNewsViewCount, resolveNewsDetailHref } from "@/core/news";
import { resolveMediaUrl } from "@/lib/media";
import { toText } from "@/lib/normalize";

const Cover = ({
  title,
  coverImg,
}: {
  title: string;
  coverImg: string | null;
}) => {
  const mediaUrl = resolveMediaUrl(coverImg);

  if (mediaUrl) {
    return (
      <Image
        src={mediaUrl}
        alt={title}
        width={640}
        height={352}
        unoptimized
        className="h-44 w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-44 items-end bg-[linear-gradient(135deg,hsl(var(--muted)),hsl(var(--card))_72%)] p-5">
      <div className="rounded-2xl border border-border/70 bg-card/95 px-4 py-3 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          News
        </p>
        <p className="mt-2 text-sm text-foreground">资讯封面待接入</p>
      </div>
    </div>
  );
};

export const RecommendedSection = ({
  items,
  error,
}: {
  items: NewsArticle[];
  error: string | null;
}) => {
  const visibleItems: NewsArticle[] = items.length
    ? items
    : Array.from({ length: 4 }, (_, index) => ({
        id: `recommended-placeholder-${index + 1}`,
        title: `推荐资讯 ${index + 1}`,
        remark: "推荐资讯暂未返回，待接口恢复后这里会展示真实内容。",
        publishTime: "等待接口返回",
      }));
  const featured = visibleItems[0];
  const featuredId = featured
    ? toText(featured.id, "recommended-placeholder-1")
    : "recommended-placeholder-1";

  return (
    <MotionReveal direction="up">
      <section data-testid="news-recommended-section" className="grid gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            推荐区
          </p>
          <h2 className="text-2xl font-semibold text-foreground">编辑推荐</h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            推荐区不再只是安全四宫格，而是先给一个更强的主内容位，再用余下卡片补充阅读线索。
          </p>
          {error ? (
            <p className="text-sm leading-6 text-destructive">{error}</p>
          ) : null}
        </div>

        <MotionStagger
          className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
          delayChildren={0.08}
        >
          <MotionItem key={featuredId}>
            <a
              href={resolveNewsDetailHref(featuredId)}
              className="group block overflow-hidden rounded-[32px] border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <Cover
                title={
                  featured ? toText(featured.title, "推荐资讯") : "推荐资讯"
                }
                coverImg={featured?.coverImg ?? null}
              />
              <div className="grid gap-4 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    推荐资讯
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {featured?.publishTime ??
                      featured?.createTime ??
                      featured?.updateTime ??
                      "-"}
                  </p>
                </div>
                <h3 className="line-clamp-2 text-2xl font-semibold tracking-tight text-foreground">
                  {featured ? toText(featured.title, "推荐资讯") : "推荐资讯"}
                </h3>
                <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">
                  {featured
                    ? toText(
                        featured.remark,
                        "摘要待补充，详情页迁移后将继续承接完整正文。"
                      )
                    : "-"}
                </p>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {featured
                      ? formatNewsViewCount(
                          featured.clickNum ?? featured.commentNum
                        )
                      : "-"}
                  </span>
                  <span className="font-medium text-foreground">进入详情</span>
                </div>
              </div>
            </a>
          </MotionItem>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {visibleItems.slice(1).map((item, index) => {
              const id = toText(item.id, `recommended-${index + 2}`);
              return (
                <MotionItem key={id}>
                  <a
                    href={resolveNewsDetailHref(id)}
                    className="group block overflow-hidden rounded-[28px] border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="grid gap-4 p-5 sm:grid-cols-[120px_minmax(0,1fr)] lg:grid-cols-[112px_minmax(0,1fr)]">
                      <div className="overflow-hidden rounded-[22px]">
                        <Cover
                          title={toText(item.title, `推荐资讯 ${index + 2}`)}
                          coverImg={item.coverImg ?? null}
                        />
                      </div>
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            推荐资讯
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.publishTime ??
                              item.createTime ??
                              item.updateTime ??
                              "发布时间待补充"}
                          </p>
                        </div>
                        <h3 className="line-clamp-2 text-lg font-semibold text-foreground">
                          {toText(item.title, `推荐资讯 ${index + 2}`)}
                        </h3>
                        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {toText(
                            item.remark,
                            "摘要待补充，详情页迁移后将继续承接完整正文。"
                          )}
                        </p>
                      </div>
                    </div>
                  </a>
                </MotionItem>
              );
            })}
          </div>
        </MotionStagger>
      </section>
    </MotionReveal>
  );
};
