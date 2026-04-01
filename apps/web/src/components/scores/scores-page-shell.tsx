"use client";

import { createApiClient, unwrapEnvelope } from "@workspace/api";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { EmptyState, SurfaceCard } from "@workspace/ui";
import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ResultsPagination } from "../common/results-pagination";
import { ScoresFilters } from "./scores-filters";
import { ScoresResults } from "./scores-results";

type PassedFilter = "" | "1" | "0";

interface ScoreFiltersState {
  examTitle: string;
  passed: PassedFilter;
  pageNo: number;
  pageSize: number;
}

interface ScoreRecord {
  id: string;
  examId: string;
  examTitle: string;
  tryCount: number | null;
  maxScore: number | null;
  passed: boolean | null;
  recentExamTime: string;
}

interface ScoreResponse {
  records?: unknown[];
  total?: number;
}

const DEFAULT_FILTERS: ScoreFiltersState = {
  examTitle: "",
  passed: "",
  pageNo: 1,
  pageSize: 10,
};

const client = createApiClient({
  getToken: () => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("token");
  },
});

function createQueryString(filters: ScoreFiltersState) {
  const params = new URLSearchParams();

  if (filters.pageNo > 1) {
    params.set("page", String(filters.pageNo));
  }

  if (filters.examTitle.trim()) {
    params.set("keyword", filters.examTitle.trim());
  }

  if (filters.passed) {
    params.set("passed", filters.passed);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toNumberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toBooleanValue(value: unknown) {
  if (value === 1 || value === "1" || value === true) {
    return true;
  }

  if (value === 0 || value === "0" || value === false) {
    return false;
  }

  return null;
}

function normalizeScoreRecord(item: unknown, index: number): ScoreRecord {
  const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
  const identifier =
    record.id ??
    record.userExamId ??
    record.examId ??
    record.examCode ??
    `${record.examTitle ?? "score"}-${index}`;

  return {
    id: String(identifier),
    examId: String(record.examId ?? record.id ?? ""),
    examTitle: String(record.examTitle ?? record.title ?? `考试 ${index + 1}`),
    tryCount: toNumberValue(record.tryCount),
    maxScore: toNumberValue(record.maxScore ?? record.score),
    passed: toBooleanValue(record.passed),
    recentExamTime: toStringValue(record.updateTime ?? record.examTime ?? record.createTime),
  };
}

function getErrorMessage(error: unknown) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "成绩接口暂时不可用，请稍后重试。";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，当前仅能展示错误说明，无法宣称接口已打通。`;
  }

  if (message === "网络请求失败") {
    return "成绩接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
}

async function fetchScores(filters: ScoreFiltersState) {
  const response = await client.post<ScoreResponse>("/exam/userExamResult/list", filters);
  const payload = unwrapEnvelope(response);
  const result =
    payload && typeof payload === "object" ? (payload as ScoreResponse) : ({} as ScoreResponse);

  return {
    records: Array.isArray(result.records) ? result.records.map(normalizeScoreRecord) : [],
    total: typeof result.total === "number" ? result.total : 0,
  };
}

export function ScoresPageShell({ initialFilters }: { initialFilters: ScoreFiltersState }) {
  const router = useRouter();
  const pathname = usePathname();
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [records, setRecords] = useState<ScoreRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    setDraftFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    void fetchScores(initialFilters)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setRecords(result.records);
        setTotal(result.total);
        setError(null);
        setHasLoaded(true);
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        setRecords([]);
        setTotal(0);
        setError(getErrorMessage(requestError));
        setHasLoaded(true);
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
  }, [initialFilters, reloadVersion]);

  function navigate(nextFilters: ScoreFiltersState) {
    setIsPending(true);
    startTransition(() => {
      router.push(`${pathname}${createQueryString(nextFilters)}`, { scroll: false });
    });
  }

  function handleQuery(nextFilters: ScoreFiltersState) {
    setDraftFilters(nextFilters);
    navigate(nextFilters);
  }

  function handleReset() {
    setDraftFilters(DEFAULT_FILTERS);
    navigate(DEFAULT_FILTERS);
  }

  const totalPages = Math.max(1, Math.ceil(total / initialFilters.pageSize));

  return (
    <MotionStagger className="flex flex-col gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Scores"
          title="考试成绩查询"
          description="保留旧版成绩筛选结构，当前直接请求真实成绩接口；若未登录、环境未配置或接口异常，将展示错误提示。"
        >
          <div className="grid gap-6" data-testid="scores-filter-section">
            <ScoresFilters
              filters={draftFilters}
              isLoading={isLoading || isPending}
              onChange={setDraftFilters}
              onQuery={handleQuery}
              onReset={handleReset}
            />
            <div className="grid gap-4 md:grid-cols-3">
              <MotionReveal direction="up" delay={0.02}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <p className="text-sm text-muted-foreground">结果总数</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                    {total}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    按当前筛选条件返回的成绩记录总量。
                  </p>
                </div>
              </MotionReveal>
              <MotionReveal direction="up" delay={0.08}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <p className="text-sm text-muted-foreground">筛选状态</p>
                  <p className="mt-3 text-xl font-semibold text-foreground">
                    {initialFilters.passed === "1"
                      ? "仅看通过"
                      : initialFilters.passed === "0"
                        ? "仅看未通过"
                        : "全部结果"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {initialFilters.examTitle ? `关键词：${initialFilters.examTitle}` : "未限定考试名称。"}
                  </p>
                </div>
              </MotionReveal>
              <MotionReveal direction="up" delay={0.14}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <p className="text-sm text-muted-foreground">接口状态</p>
                  <p className="mt-3 text-xl font-semibold text-foreground">
                    {error ? "请求失败" : hasLoaded ? "已加载" : "准备中"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {error ?? "接口返回成功后会在下方渲染真实成绩记录。"}
                  </p>
                </div>
              </MotionReveal>
            </div>
          </div>
        </SurfaceCard>
      </MotionItem>

      <MotionItem>
        <SurfaceCard
          title="成绩结果"
          description="覆盖考试名称、考试次数、最高分、是否通过与最近考试时间，并支持进入某场考试的成绩明细页。"
        >
          <div data-testid="scores-results-section">
            {!hasLoaded || isLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-[24px] border border-border bg-muted/50"
                  />
                ))}
              </div>
            ) : error ? (
              <EmptyState
                title="成绩接口暂不可用"
                description={`当前无法加载成绩数据：${error}。请确认已登录且接口环境可访问后重试。`}
              />
            ) : records.length === 0 ? (
              <EmptyState
                title="暂无匹配成绩"
                description="没有查到符合条件的考试成绩，试试清空筛选或更换考试名称关键词。"
              />
            ) : (
              <ScoresResults records={records} />
            )}
          </div>
        </SurfaceCard>
      </MotionItem>

      <MotionItem>
        <MotionReveal direction="up" delay={0.12}>
          <ResultsPagination
            page={Math.min(initialFilters.pageNo, totalPages)}
            pageCount={totalPages}
            total={total}
            pending={isLoading || isPending}
            itemLabel="条成绩"
            onPageChange={(page) =>
              navigate({
                ...initialFilters,
                pageNo: page,
              })
            }
          />
        </MotionReveal>
      </MotionItem>

      {error ? (
        <MotionItem>
          <button
            type="button"
            className="text-left text-sm text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => {
              setIsPending(false);
              setReloadVersion((value) => value + 1);
            }}
          >
            重新请求当前列表
          </button>
        </MotionItem>
      ) : null}
    </MotionStagger>
  );
}
