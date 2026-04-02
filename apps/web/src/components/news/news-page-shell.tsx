"use client";

import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge } from "@workspace/ui";
import { ResultsPagination } from "../common/results-pagination";
import { fetchNewsPageData, fetchNewsSuggestions, normalizeNewsError } from "./news-data";
import { NewsHotSidebar } from "./news-hot-sidebar";
import { NewsRecommendedSection } from "./news-recommended-section";
import { NewsResults } from "./news-results";
import { NewsSearchForm } from "./news-search-form";
import { NEWS_PAGE_SIZE, type NewsListItem, type NewsQueryState, type NewsSectionCard, type NewsSuggestionItem } from "./news-types";

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
  const summaryItems = [
    { label: "分页规模", value: `${NEWS_PAGE_SIZE} 条/页` },
    { label: "当前关键词", value: initialQuery.keyword || "全部资讯" },
    { label: "接口状态", value: getStatusCopy(error, isLoading, total) },
  ];

  return (
    <div className="grid gap-6">
      <MotionReveal direction="up">
        <section className="rounded-[32px] border border-border bg-card/85 p-6 shadow-sm">
          <div className="grid gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <div>
                  <Badge>News</Badge>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold text-foreground">新闻资讯中心</h2>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                    将旧 Vue 学员端资讯主页迁移到 Next.js 学员端，优先打通推荐、搜索、列表、热榜和分页链路，并保留详情入口占位。
                  </p>
                </div>
              </div>

              <MotionStagger className="grid gap-3 sm:grid-cols-3" delayChildren={0.08}>
                {summaryItems.map((item) => (
                  <MotionItem key={item.label}>
                    <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{item.value}</p>
                    </div>
                  </MotionItem>
                ))}
              </MotionStagger>
            </div>
          </div>
        </section>
      </MotionReveal>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_340px]">
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
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              资讯列表
            </p>
            <h2 className="text-2xl font-semibold text-foreground">结果区</h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              列表卡片覆盖标题、摘要、发布时间和详情入口；搜索模式下会沿用关键词结果并继续支持分页切换。
            </p>
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
