"use client";

import { useQuery } from "@tanstack/react-query";
import { Monitor, Settings2, ShieldCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { ScoresFilters } from "./filters";
import { ScoresResults } from "./results";
import { ResultsPagination } from "../common/results-pagination";
import { normalizeScoreError, scoreQueryOptions } from "@/core/scores";
import {
  SCORE_PASS_OPTIONS,
  SCORE_PASS_STATE,
  SCORES_PAGE_SIZE,
} from "@/core/scores";
import type { ScoreFiltersState, ScorePassFilter } from "@/core/scores";

const DEFAULT_FILTERS: ScoreFiltersState = {
  examTitle: "",
  passed: SCORE_PASS_STATE.ALL,
  pageNo: 1,
  pageSize: SCORES_PAGE_SIZE,
};

const createQueryString = (filters: ScoreFiltersState) => {
  const params = new URLSearchParams();

  if (filters.pageNo > 1) {
    params.set("page", String(filters.pageNo));
  }

  if (filters.examTitle.trim()) {
    params.set("keyword", filters.examTitle.trim());
  }

  if (filters.passed !== SCORE_PASS_STATE.ALL) {
    params.set("passed", filters.passed);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

const getPassedSummary = (value: ScorePassFilter) =>
  SCORE_PASS_OPTIONS.find((item) => item.value === value)?.label ?? "全部成绩";

export const ScoresPage = ({
  initialFilters,
}: {
  initialFilters: ScoreFiltersState;
}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const scoresQuery = useQuery(scoreQueryOptions.list(initialFilters));
  const records = scoresQuery.data?.records ?? [];
  const total = scoresQuery.data?.total ?? 0;
  const error = scoresQuery.error
    ? normalizeScoreError(scoresQuery.error)
    : null;
  const isLoading = scoresQuery.isLoading;
  const isBusy = isLoading || isPending;
  const totalPages = Math.max(1, Math.ceil(total / SCORES_PAGE_SIZE));
  const currentPage = Math.min(initialFilters.pageNo, totalPages);

  const navigate = (nextFilters: ScoreFiltersState) => {
    startTransition(() => {
      router.push(`${pathname}${createQueryString(nextFilters)}`, {
        scroll: false,
      });
    });
  };

  useEffect(() => {
    if (isLoading || error || initialFilters.pageNo <= totalPages) {
      return;
    }

    const normalizedFilters = {
      ...initialFilters,
      pageNo: totalPages,
    };

    startTransition(() => {
      router.push(`${pathname}${createQueryString(normalizedFilters)}`, {
        scroll: false,
      });
    });
  }, [
    error,
    initialFilters,
    isLoading,
    pathname,
    router,
    startTransition,
    totalPages,
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="relative overflow-hidden border-b border-border/40 bg-muted/20">
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(0,0,0,0.03)_1px,rgba(0,0,0,0.03)_2px)] opacity-50" />

        <div className="relative z-10 mx-auto max-w-7xl px-8 py-16 lg:px-12 lg:py-24">
          <div className="flex flex-col justify-between gap-12 md:flex-row md:items-end">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-primary" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-primary opacity-80">
                  PERSONAL.RECORDS // 考试成绩中心
                </span>
              </div>
              <h1 className="text-6xl font-black lowercase leading-[0.85] tracking-tighter text-foreground lg:text-8xl">
                成绩中心<span className="text-primary">.</span>列表
              </h1>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/50">
                    数据来源
                  </span>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="font-mono text-xs font-bold text-foreground">
                      OFFICIAL_DATA
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/50">
                    当前状态
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 animate-pulse rounded-full ${
                        error ? "bg-destructive" : "bg-primary"
                      }`}
                    />
                    <span className="font-mono text-xs font-bold text-foreground">
                      {error ? "数据异常" : scoresQuery.isSuccess ? "已更新" : "加载中"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-16 border-l border-border/20 py-4 pl-12 lg:gap-24 lg:pl-16">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60">
                  累计考试/记录
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-5xl font-black tracking-tighter text-foreground lg:text-7xl">
                    {isLoading ? "--" : total}
                  </span>
                  <span className="text-xs font-bold text-foreground opacity-30">
                    次
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60">
                  当前筛选/状态
                </span>
                <div className="flex items-baseline gap-2 text-right">
                  <span className="text-xl font-black tracking-tight text-foreground">
                    {getPassedSummary(initialFilters.passed)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="relative border-b border-border/40 bg-background">
        <div className="mx-auto max-w-7xl px-8 py-10 lg:px-12">
          <div className="mb-8 flex items-center gap-4">
            <Settings2 className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/80">
              列表筛选 // SEARCH_FILTERS
            </span>
          </div>
          <ScoresFilters
            key={`${initialFilters.examTitle}:${initialFilters.passed}`}
            filters={initialFilters}
            isLoading={isBusy}
            onQuery={navigate}
            onReset={() => navigate(DEFAULT_FILTERS)}
          />
        </div>
      </section>

      <main className="relative flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-8 py-20 lg:px-12">
          <div className="mb-16 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Monitor className="h-4 w-4 text-primary" />
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">
                  RESULT_RECORDS
                </span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                考试记录列表
              </h3>
            </div>
            <div className="flex items-center gap-4 border border-border/20 bg-muted/10 px-4 py-2">
              <span className="font-mono text-[10px] font-bold text-foreground/60 opacity-50">
                BATCH_SIZE: {SCORES_PAGE_SIZE}
              </span>
            </div>
          </div>

          <ScoresResults
            records={records}
            loading={isBusy}
            error={error}
            onRetry={() => {
              void scoresQuery.refetch();
            }}
          />

          <div className="mt-24 border-t border-border/40 pt-12">
            <ResultsPagination
              page={currentPage}
              pageCount={totalPages}
              total={total}
              pending={isBusy}
              itemLabel="条考试成绩记录"
              onPageChange={(page) =>
                navigate({ ...initialFilters, pageNo: page })
              }
            />
          </div>
        </div>

        <div className="h-64 bg-linear-to-t from-muted-foreground/10 to-transparent opacity-50" />
      </main>
    </div>
  );
};
