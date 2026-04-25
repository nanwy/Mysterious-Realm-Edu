"use client";

import { useQuery } from "@tanstack/react-query";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Avatar, AvatarFallback, AvatarImage, EmptyState } from "@workspace/ui";
import {
  ArrowLeft,
  Clock3,
  Flame,
  MoveUpRight,
  Newspaper,
  ScanText,
} from "lucide-react";
import Link from "next/link";
import { newsQueryOptions, normalizeNewsError } from "@/core/news";

const LoadingState = () => (
  <section className="rounded-[32px] border border-border/80 bg-card/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
    <div className="flex min-h-72 items-center justify-center rounded-[28px] border border-dashed border-border/70 bg-muted/35 px-6 py-14">
      <div
        className="flex items-center gap-3 text-sm text-muted-foreground"
        data-testid="news-detail-loading"
      >
        <span
          className="size-2 animate-pulse rounded-full bg-primary"
          aria-hidden="true"
        />
        <span>正在加载资讯详情...</span>
      </div>
    </div>
  </section>
);

const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <section className="rounded-[32px] border border-border/80 bg-card/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
    <div
      className="grid gap-4 rounded-[28px] border border-border/70 bg-background/70 p-6"
      data-testid="news-detail-error"
    >
      <EmptyState title="读取失败" description={message} />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          重新加载
        </button>
        <Link
          href="/news"
          className="inline-flex items-center justify-center rounded-full border border-border/70 bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-accent/40"
        >
          返回资讯列表
        </Link>
      </div>
    </div>
  </section>
);

const EmptyDetailState = () => (
  <section className="rounded-[32px] border border-border/80 bg-card/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
    <div
      className="grid gap-4 rounded-[28px] border border-border/70 bg-background/70 p-6"
      data-testid="news-detail-empty"
    >
      <EmptyState
        title="暂无内容"
        description="请稍后重试，或返回资讯列表选择其他文章。"
      />
      <div>
        <Link
          href="/news"
          className="inline-flex items-center justify-center rounded-full border border-border/70 bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-accent/40"
        >
          返回资讯列表
        </Link>
      </div>
    </div>
  </section>
);

const ReadingSignal = ({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) => (
  <div className="rounded-[24px] border border-border/70 bg-background/78 px-4 py-4">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </p>
    <p className="mt-3 text-xl font-semibold tracking-[-0.04em] text-foreground">
      {value}
    </p>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{note}</p>
  </div>
);

export const NewsDetailPage = ({ newsId }: { newsId: string }) => {
  const detailQuery = useQuery(newsQueryOptions.detail(newsId));
  const article = detailQuery.data?.article ?? null;
  const hotNews = detailQuery.data?.hotNews ?? [];

  if (detailQuery.isLoading) {
    return <LoadingState />;
  }

  if (detailQuery.error) {
    return (
      <ErrorState
        message={normalizeNewsError(detailQuery.error)}
        onRetry={() => {
          void detailQuery.refetch();
        }}
      />
    );
  }

  if (!article) {
    return <EmptyDetailState />;
  }

  const authorFallback = article.authorName.slice(0, 1) || "资";

  return (
    <MotionStagger
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
      delayChildren={0.08}
    >
      <MotionItem>
        <div className="grid gap-6">
          <MotionReveal
            direction="up"
            className="overflow-hidden rounded-[34px] border border-border/80 bg-gradient-to-br from-card via-card to-accent/35 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
            data-testid="news-detail-title-section"
          >
            <div className="border-b border-border/70 px-5 py-4 sm:px-6">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                返回资讯列表
              </Link>
            </div>

            <div className="grid gap-6 px-5 py-6 sm:px-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.75fr)] xl:items-start">
              <div className="grid gap-6">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  <span className="inline-flex items-center gap-2">
                    <Newspaper className="size-4" />
                    {article.source}
                  </span>
                  <span className="rounded-full border border-border/70 bg-background/75 px-3 py-1 text-[10px] tracking-[0.18em] text-muted-foreground">
                    资讯 ID {article.id}
                  </span>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    文章详情
                  </p>
                  <h2 className="max-w-4xl text-[clamp(2.3rem,5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.06em] text-foreground">
                    {article.title}
                  </h2>
                  <p className="max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                    {article.summary}
                  </p>
                </div>

                <div className="flex flex-col gap-4 rounded-[28px] border border-border/70 bg-background/72 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-12 border border-border/70">
                      {article.authorAvatar ? (
                        <AvatarImage
                          src={article.authorAvatar}
                          alt={article.authorName}
                        />
                      ) : null}
                      <AvatarFallback>{authorFallback}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {article.authorName}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Clock3 className="size-4" />
                        {article.publishTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-sm font-medium text-foreground">
                      浏览 {article.viewCountText}
                    </span>
                    <span className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-sm font-medium text-foreground">
                      正文已接入
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <ReadingSignal
                  label="阅读定位"
                  value="正文阅读"
                  note="当前页只保留标题、摘要、作者和正文，避免阅读前先被一组附属卡片打断。"
                />
                <ReadingSignal
                  label="热度信号"
                  value={`Top ${Math.max(hotNews.length, 1)}`}
                  note="右侧热榜保留为辅助流，不和正文争抢主视觉。"
                />
                <ReadingSignal
                  label="阅读建议"
                  value="先看摘要"
                  note="先用摘要判断相关性，再继续阅读完整正文，会比在列表里反复跳转更快。"
                />
              </div>
            </div>
          </MotionReveal>

          <MotionReveal direction="up" delay={0.05}>
            <section
              className="rounded-[32px] border border-border/80 bg-card/92 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-6"
              data-testid="news-detail-content-section"
            >
              <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    正文内容
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                    从摘要判断，再进入完整阅读
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                    富文本内容直接承接旧文章接口，并限制图片、预格式文本和表格宽度，减少移动端横向溢出。
                  </p>
                </div>
                <div className="rounded-[20px] border border-border/70 bg-background/75 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    阅读语境
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <ScanText className="size-4 text-primary" />
                    详情页承接列表阅读流
                  </p>
                </div>
              </div>
              <article
                data-testid="news-detail-body"
                className="prose prose-neutral mt-6 max-w-none text-foreground dark:prose-invert [&_a]:break-all [&_a]:text-primary [&_blockquote]:rounded-r-2xl [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:bg-muted/40 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:object-contain [&_li]:marker:text-primary [&_p]:leading-8 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-slate-950 [&_pre]:p-4 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:text-sm [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:border [&_th]:border-border [&_th]:bg-muted/70 [&_th]:p-2 [&_ul]:pl-6"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </section>
          </MotionReveal>
        </div>
      </MotionItem>

      <MotionItem>
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <div className="grid gap-4">
            <section className="rounded-[30px] border border-border/80 bg-card/92 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Hot News
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                热点追踪
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                右侧只保留轻量热榜，帮助继续阅读，不制造第二个主舞台。
              </p>

              <div className="mt-5 grid gap-3" data-testid="news-detail-hot-news">
                {hotNews.length ? (
                  hotNews.map((item, index) => (
                    <MotionReveal key={item.id} direction="left" delay={index * 0.04}>
                      <Link
                        href={`/news/detail/${item.id}`}
                        className="group flex items-start gap-4 rounded-[24px] border border-border/70 bg-background/72 p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent/35"
                      >
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold ${
                            index === 0
                              ? "bg-primary text-primary-foreground"
                              : index < 3
                                ? "bg-primary/15 text-primary"
                                : "bg-card text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            <Flame className="size-3.5 text-primary" />
                            热榜条目
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-foreground">
                            {item.title}
                          </p>
                          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                            <span>浏览量 {item.viewCountText}</span>
                            <span className="inline-flex items-center gap-1 text-foreground transition group-hover:text-primary">
                              阅读
                              <MoveUpRight className="size-3.5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </MotionReveal>
                  ))
                ) : (
                  <EmptyState
                    title="热点列表暂未返回"
                    description="详情接口可正常阅读时，热榜接口失败会单独降级为空状态。"
                  />
                )}
              </div>
            </section>

            <section className="rounded-[30px] border border-border/80 bg-gradient-to-br from-background via-card to-accent/30 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Next Step
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-foreground">
                返回资讯流继续浏览
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                当前页完成阅读后，优先回到列表继续看下一篇，而不是停留在孤立详情页。
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row xl:flex-col">
                <Link
                  href="/news"
                  className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  返回资讯中心
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-[18px] border border-border/70 bg-card/80 px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-accent/35"
                >
                  回到首页
                </Link>
              </div>
            </section>
          </div>
        </aside>
      </MotionItem>
    </MotionStagger>
  );
};

