"use client";

import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge } from "@workspace/ui";
import { ArrowRight, Flame, ScanSearch, Sparkles } from "lucide-react";
import { ResultsPagination } from "../common/results-pagination";
import { fetchNewsPageData, fetchNewsSuggestions, normalizeNewsError } from "./news-data";
import { NewsHotSidebar } from "./news-hot-sidebar";
import { NewsRecommendedSection } from "./news-recommended-section";
import { NewsResults } from "./news-results";
import { NewsSearchForm } from "./news-search-form";
import {
  NEWS_PAGE_SIZE,
  type NewsListItem,
  type NewsQueryState,
  type NewsSectionCard,
  type NewsSuggestionItem,
} from "./news-types";

function createQueryString(query: NewsQueryState) {
  const params = new URLSearchParams();

  if (query.page > 1) {
    params.set("page", String(query.page));
  }

  if (query.keyword.trim()) {
    params.set("keyword", query.keyword.trim());
  }

  const result = params.toString();
  return result ? `?${result}` : "";
}

function getStatusCopy(error: string | null, loading: boolean, total: number) {
  if (error) {
    return "接口异常";
  }

  if (loading) {
    return "加载中";
  }

  return `${total} 条资讯`;
}

export function NewsPageShell({ initialQuery }: { initialQuery: NewsQueryState }) {
  const router = useRouter();
  const pathname = usePathname();
  const [recommendedItems, setRecommendedItems] = useState<NewsSectionCard[]>([]);
  const [hotItems, setHotItems] = useState<NewsListItem[]>([]);
  const [items, setItems] = useState<NewsListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recommendedError, setRecommendedError] = useState<string | null>(null);
  const [hotError, setHotError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [keywordInput, setKeywordInput] = useState(initialQuery.keyword);
  const [suggestions, setSuggestions] = useState<NewsSuggestionItem[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const deferredKeyword = useDeferredValue(keywordInput);

  useEffect(() => {
    setKeywordInput(initialQuery.keyword);
  }, [initialQuery.keyword]);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);
    setRecommendedError(null);
    setHotError(null);

    void fetchNewsPageData(initialQuery)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setRecommendedItems(result.recommended);
        setHotItems(result.hot);
        setItems(result.items);
        setTotal(result.total);
        setRecommendedError(result.recommendedError);
        setHotError(result.hotError);
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        setRecommendedItems([]);
        setHotItems([]);
        setItems([]);
        setTotal(0);
        const message = normalizeNewsError(requestError);
        setError(message);
        setRecommendedError(message);
        setHotError(message);
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        setIsLoading(false);
        setIsPending(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialQuery, reloadVersion]);

  useEffect(() => {
    const trimmed = deferredKeyword.trim();
    if (!trimmed) {
      setSuggestions([]);
      setSuggestionsError(null);
      setSuggestionsLoading(false);
      return;
    }

    let cancelled = false;
    setSuggestionsLoading(true);
    setSuggestionsError(null);

    void fetchNewsSuggestions(trimmed)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setSuggestions(result);
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        setSuggestions([]);
        setSuggestionsError(normalizeNewsError(requestError));
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        setSuggestionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [deferredKeyword]);

  const navigate = (nextQuery: NewsQueryState) => {
    setIsPending(true);
    startTransition(() => {
      router.push(`${pathname}${createQueryString(nextQuery)}`, {
        scroll: false,
      });
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / NEWS_PAGE_SIZE));
  const hasKeyword = initialQuery.keyword.trim().length > 0;
  const currentModeLabel = hasKeyword ? "关键词检索" : "编辑推荐";
  const summaryItems = [
    {
      label: "当前模式",
      value: currentModeLabel,
      detail: hasKeyword ? "优先返回标题命中的结果" : "推荐区、热榜与列表同步承接",
    },
    {
      label: "当前关键词",
      value: initialQuery.keyword || "全部资讯",
      detail: hasKeyword ? "搜索建议跟随输入变化" : "未限定关键词，展示完整资讯流",
    },
    {
      label: "列表状态",
      value: getStatusCopy(error, isLoading, total),
      detail: `${NEWS_PAGE_SIZE} 条/页 · 第 ${Math.min(initialQuery.page, totalPages)} 页`,
    },
  ];
  const editorialSignals = [
    {
      icon: Sparkles,
      title: "先读推荐，再进列表",
      description: "首屏先展示平台重点内容，再把用户送进完整资讯流。",
    },
    {
      icon: ScanSearch,
      title: "搜索建议直接承接",
      description: "关键词区强调检索动作，减少从列表里二次筛找。",
    },
    {
      icon: Flame,
      title: "热榜保留追踪价值",
      description: "右侧热榜继续承担快速切换阅读目标的作用。",
    },
  ];

  return (
    <div className="grid gap-6">
      <MotionReveal direction="up">
        <section className="overflow-hidden rounded-[36px] border border-border bg-card/90 shadow-sm">
          <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1.35fr)_360px] lg:p-8">
            <div className="grid gap-6">
              <div className="space-y-4">
                <Badge>News</Badge>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    <span>内容门户</span>
                    <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[10px] tracking-[0.18em] text-muted-foreground">
                      {hasKeyword ? `检索 ${initialQuery.keyword}` : "今日资讯流"}
                    </span>
                  </div>
                  <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    把旧站资讯入口收束成可浏览、可搜索、可继续追踪的平台阅读页。
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                    这轮不再把 `/news` 停留在接口说明卡。推荐、热榜、搜索与结果区现在围绕同一条阅读主路径展开，用户进来先看到平台重点，再继续深入。
                  </p>
                </div>
              </div>

              <MotionStagger className="grid gap-3 md:grid-cols-3" delayChildren={0.08}>
                {summaryItems.map((item) => (
                  <MotionItem key={item.label}>
                    <div className="rounded-[24px] border border-border/70 bg-background/75 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{item.value}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                    </div>
                  </MotionItem>
                ))}
              </MotionStagger>

              <MotionStagger className="grid gap-3 md:grid-cols-3" delayChildren={0.08}>
                {editorialSignals.map((item) => {
                  const Icon = item.icon;

                  return (
                    <MotionItem key={item.title}>
                      <article className="rounded-[24px] border border-border/70 bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--muted)/0.7)_100%)] px-4 py-4">
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="size-4" />
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                      </article>
                    </MotionItem>
                  );
                })}
              </MotionStagger>
            </div>

            <MotionReveal
              direction="left"
              className="rounded-[32px] border border-border/70 bg-[linear-gradient(160deg,hsl(var(--primary)/0.12),hsl(var(--card))_45%,hsl(var(--background))_100%)] p-5"
            >
              <div className="grid gap-5">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    阅读总览
                  </p>
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                    {hasKeyword ? "当前正在关键词检索模式" : "先看推荐，再进入完整资讯流"}
                  </h3>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {hasKeyword
                      ? "搜索结果保持推荐区与热榜上下文不丢失，同时把正文入口、摘要与时间信息收进同一条扫读路径。"
                      : "推荐区负责建立当天重点，热榜提供快速追踪，列表区继续承接完整浏览与分页。"}
                  </p>
                </div>

                <div className="grid gap-3 rounded-[28px] border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">本轮阅读焦点</p>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                  <div className="grid gap-3 text-sm text-muted-foreground">
                    <div className="flex items-start justify-between gap-4 rounded-[20px] border border-border/60 bg-card/80 px-4 py-3">
                      <span>推荐区优先展示平台信号</span>
                      <span className="text-foreground">{recommendedItems.length || 4} 条</span>
                    </div>
                    <div className="flex items-start justify-between gap-4 rounded-[20px] border border-border/60 bg-card/80 px-4 py-3">
                      <span>热榜持续补充热点线索</span>
                      <span className="text-foreground">{hotItems.length || 5} 条</span>
                    </div>
                    <div className="flex items-start justify-between gap-4 rounded-[20px] border border-border/60 bg-card/80 px-4 py-3">
                      <span>列表区维持完整分页浏览</span>
                      <span className="text-foreground">{totalPages} 页</span>
                    </div>
                  </div>
                </div>
              </div>
            </MotionReveal>
          </div>
        </section>
      </MotionReveal>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_340px]">
        <NewsRecommendedSection items={recommendedItems} error={recommendedError} />
        <NewsHotSidebar items={hotItems} error={hotError} />
      </section>

      <NewsSearchForm
        defaultKeyword={initialQuery.keyword}
        pending={isPending}
        suggestions={suggestions}
        suggestionsLoading={suggestionsLoading}
        suggestionsError={suggestionsError}
        onKeywordChange={setKeywordInput}
        onSubmit={(keyword) =>
          navigate({
            page: 1,
            keyword,
          })
        }
        onReset={() =>
          navigate({
            page: 1,
            keyword: "",
          })
        }
      />

      <MotionReveal direction="up" delay={0.08}>
        <section data-testid="news-list-section" className="grid gap-4">
          <div className="rounded-[28px] border border-border/70 bg-card/85 p-5 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  资讯列表
                </p>
                <h2 className="text-2xl font-semibold text-foreground">
                  {hasKeyword ? "关键词结果区" : "完整资讯流"}
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  {hasKeyword
                    ? "搜索结果保持推荐区与热榜上下文不丢失，同时把正文入口、摘要与时间信息放在同一条扫读路径里。"
                    : "列表区补齐封面、发布时间、摘要和详情入口，让浏览节奏从推荐内容自然过渡到完整归档。"}
                </p>
              </div>
              <div className="grid gap-3 rounded-[24px] border border-border/70 bg-background/75 p-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <span>当前页</span>
                  <span className="font-semibold text-foreground">
                    {Math.min(initialQuery.page, totalPages)} / {totalPages}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>检索状态</span>
                  <span className="font-semibold text-foreground">{currentModeLabel}</span>
                </div>
              </div>
            </div>
          </div>
          <NewsResults
            items={items}
            loading={isLoading}
            error={error}
            keyword={initialQuery.keyword}
            onRetry={() => {
              setIsPending(false);
              setReloadVersion((value) => value + 1);
            }}
          />
        </section>
      </MotionReveal>

      <MotionReveal direction="up" delay={0.12}>
        <section data-testid="news-pagination-section">
          <ResultsPagination
            page={Math.min(initialQuery.page, totalPages)}
            pageCount={totalPages}
            total={total}
            pending={isPending}
            itemLabel="条资讯"
            onPageChange={(page) =>
              navigate({
                ...initialQuery,
                page,
              })
            }
          />
        </section>
      </MotionReveal>
    </div>
  );
}
