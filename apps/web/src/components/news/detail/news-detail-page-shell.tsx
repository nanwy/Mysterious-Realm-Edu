"use client";

import { getNewsDetail, listHotNews, unwrapEnvelope } from "@workspace/api";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  EmptyState,
  SurfaceCard,
} from "@workspace/ui";
import { resolveMediaUrl } from "@/lib/media";
import { useEffect, useState } from "react";

interface NewsDetailState {
  article: NewsDetailRecord | null;
  hotNews: HotNewsRecord[];
  error: string | null;
  loading: boolean;
}

interface NewsDetailRecord {
  id: string;
  title: string;
  content: string;
  summary: string;
  authorName: string;
  authorAvatar: string | null;
  publishTime: string;
  viewCountText: string;
  source: string;
}

interface HotNewsRecord {
  id: string;
  title: string;
  viewCountText: string;
}

function toRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function toText(value: unknown, fallback = "") {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function toHtml(value: unknown) {
  const text = toText(value);
  if (!text) {
    return "";
  }

  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }

  return text
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function normalizeNewsDetail(payload: unknown, newsId: string): NewsDetailRecord | null {
  const record = toRecord(payload);
  const title = toText(record.title);
  const content = toHtml(record.content ?? record.articleContent ?? record.remark);

  if (!title && !content) {
    return null;
  }

  return {
    id: toText(record.id, newsId),
    title: title || "未命名资讯",
    content,
    summary: toText(record.remark ?? record.summary, "当前资讯暂无摘要说明。"),
    authorName: toText(record.createByName ?? record.publishByName ?? record.author, "平台资讯"),
    authorAvatar: resolveMediaUrl(toText(record.avatar ?? record.authorAvatar)) ?? null,
    publishTime: toText(record.publishTime ?? record.createTime ?? record.updateTime, "发布时间待同步"),
    viewCountText: toText(record.commentNum ?? record.viewCount ?? record.readCount, "0"),
    source: toText(record.source ?? record.newsSource, "神秘领域教育"),
  };
}

function normalizeHotNews(payload: unknown) {
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(toRecord(payload).records)
      ? (toRecord(payload).records as unknown[])
      : [];

  return records.slice(0, 5).map((item, index) => {
    const record = toRecord(item);

    return {
      id: toText(record.id, `hot-news-${index + 1}`),
      title: toText(record.title, `热门资讯 ${index + 1}`),
      viewCountText: toText(record.commentNum ?? record.viewCount ?? record.readCount, "0"),
    };
  });
}

function getNewsDetailErrorMessage(error: unknown) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "资讯详情接口暂时不可用，请稍后重试。";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，当前仅展示错误说明。`;
  }

  if (message === "网络请求失败") {
    return "资讯详情接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
}

async function fetchNewsDetail(newsId: string) {
  const response = await getNewsDetail(newsId);
  return normalizeNewsDetail(unwrapEnvelope(response), newsId);
}

async function fetchHotNews() {
  try {
    const response = await listHotNews({
      pageNo: 1,
      pageSize: 5,
    });
    return normalizeHotNews(unwrapEnvelope(response));
  } catch {
    return [];
  }
}

function NewsDetailLoadingState() {
  return (
    <SurfaceCard
      eyebrow="Loading"
      title="资讯详情加载中"
      description="正在读取文章标题、元信息和正文内容。"
    >
      <div
        className="flex min-h-72 items-center justify-center rounded-[24px] border border-dashed border-border/70 bg-muted/40"
        data-testid="news-detail-loading"
      >
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="size-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
          <span>正在加载资讯详情...</span>
        </div>
      </div>
    </SurfaceCard>
  );
}

function NewsDetailErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <SurfaceCard
      eyebrow="Unavailable"
      title="资讯详情暂时不可用"
      description="接口环境未配置或请求失败时，只展示明确错误说明，不伪造正文数据。"
    >
      <div className="grid gap-4" data-testid="news-detail-error">
        <EmptyState title="读取失败" description={message} />
        <div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            重新加载
          </button>
        </div>
      </div>
    </SurfaceCard>
  );
}

function NewsDetailEmptyState() {
  return (
    <SurfaceCard
      eyebrow="Empty"
      title="这篇资讯暂时没有可展示的正文"
      description="接口已返回，但正文或标题字段为空，因此只保留空状态说明。"
    >
      <div data-testid="news-detail-empty">
        <EmptyState
          title="暂无内容"
          description="请稍后重试，或返回资讯列表选择其他文章。"
        />
      </div>
    </SurfaceCard>
  );
}

export function NewsDetailPageShell({ newsId }: { newsId: string }) {
  const [state, setState] = useState<NewsDetailState>({
    article: null,
    hotNews: [],
    error: null,
    loading: true,
  });
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    void Promise.all([fetchNewsDetail(newsId), fetchHotNews()])
      .then(([article, hotNews]) => {
        if (cancelled) {
          return;
        }

        setState({
          article,
          hotNews,
          error: null,
          loading: false,
        });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setState({
          article: null,
          hotNews: [],
          error: getNewsDetailErrorMessage(error),
          loading: false,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [newsId, reloadVersion]);

  if (state.loading) {
    return <NewsDetailLoadingState />;
  }

  if (state.error) {
    return (
      <NewsDetailErrorState
        message={state.error}
        onRetry={() => setReloadVersion((version) => version + 1)}
      />
    );
  }

  if (!state.article) {
    return <NewsDetailEmptyState />;
  }

  const article = state.article;
  const authorFallback = article.authorName.slice(0, 1) || "资";

  return (
    <MotionStagger className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Article Detail"
          title="文章详情"
          description="沿用旧站文章详情的信息结构，在 Next.js 学员端补齐阅读承接页。"
        >
          <div className="grid gap-6">
            <MotionReveal
              direction="up"
              className="grid gap-5"
              data-testid="news-detail-title-section"
            >
              <div className="space-y-4 rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(79,70,229,0.08),rgba(15,23,42,0.02))] p-6 dark:bg-[linear-gradient(135deg,rgba(99,102,241,0.18),rgba(15,23,42,0.72))]">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  <span>{article.source}</span>
                  <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[10px] tracking-[0.18em] text-muted-foreground">
                    浏览 {article.viewCountText}
                  </span>
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {article.title}
                </h2>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{article.summary}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {article.authorAvatar ? (
                        <AvatarImage src={article.authorAvatar} alt={article.authorName} />
                      ) : null}
                      <AvatarFallback>{authorFallback}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{article.authorName}</p>
                      <p>{article.publishTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </MotionReveal>

            <MotionReveal direction="up" delay={0.05}>
              <section
                className="rounded-[28px] border border-border/70 bg-background/90 p-6 shadow-sm"
                data-testid="news-detail-content-section"
              >
                <div className="mb-5 flex items-center justify-between gap-4 border-b border-border/70 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                      正文内容
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      富文本内容直接承接旧文章接口，并限制图片与表格宽度避免溢出。
                    </p>
                  </div>
                </div>
                <article
                  data-testid="news-detail-body"
                  className="prose prose-neutral max-w-none text-foreground dark:prose-invert [&_a]:break-all [&_a]:text-primary [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:bg-muted/40 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:object-contain [&_li]:marker:text-primary [&_p]:leading-8 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-slate-950 [&_pre]:p-4 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:text-sm [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:border [&_th]:border-border [&_th]:bg-muted/70 [&_th]:p-2 [&_ul]:pl-6"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </section>
            </MotionReveal>
          </div>
        </SurfaceCard>
      </MotionItem>

      <MotionItem>
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <SurfaceCard
            eyebrow="Hot News"
            title="热点追踪"
            description="延续旧详情页右侧热榜结构，但不反向要求改列表页。"
          >
            <div className="grid gap-3" data-testid="news-detail-hot-news">
              {state.hotNews.length ? (
                state.hotNews.map((item, index) => (
                  <MotionReveal key={item.id} direction="left" delay={index * 0.04}>
                    <article className="group rounded-[24px] border border-border/70 bg-muted/35 p-4 transition hover:border-primary/30 hover:bg-muted/55">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex size-9 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold ${
                            index === 0
                              ? "bg-primary text-primary-foreground"
                              : index < 3
                                ? "bg-primary/15 text-primary"
                                : "bg-background text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold leading-6 text-foreground">
                            {item.title}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            浏览量 {item.viewCountText}
                          </p>
                        </div>
                      </div>
                    </article>
                  </MotionReveal>
                ))
              ) : (
                <EmptyState
                  title="热点列表暂未返回"
                  description="详情接口可正常阅读时，热榜接口失败会单独降级为空状态。"
                />
              )}
            </div>
          </SurfaceCard>
        </aside>
      </MotionItem>
    </MotionStagger>
  );
}
