"use client";

import { createApiClient, unwrapEnvelope } from "@workspace/api";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { EmptyState, SurfaceCard } from "@workspace/ui";
import { useEffect, useState } from "react";
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

function toStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toNumberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
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
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "成绩接口暂时不可用，请稍后重试。";
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

export function ScoresPageShell() {
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [activeFilters, setActiveFilters] = useState(DEFAULT_FILTERS);
  const [records, setRecords] = useState<ScoreRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);

    void fetchScores(activeFilters)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setRecords(result.records);
        setTotal(result.total);
        setError(null);
        setHasLoaded(true);
        setIsLoading(false);
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        setRecords([]);
        setTotal(0);
        setError(getErrorMessage(requestError));
        setHasLoaded(true);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeFilters]);

  function handleQuery() {
    setActiveFilters({
      ...draftFilters,
      examTitle: draftFilters.examTitle.trim(),
      pageNo: 1,
    });
  }

  function handleReset() {
    setDraftFilters(DEFAULT_FILTERS);
    setActiveFilters(DEFAULT_FILTERS);
  }

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
              isLoading={isLoading}
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
                    {activeFilters.passed === "1"
                      ? "仅看通过"
                      : activeFilters.passed === "0"
                        ? "仅看未通过"
                        : "全部结果"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {activeFilters.examTitle ? `关键词：${activeFilters.examTitle}` : "未限定考试名称。"}
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
          description="覆盖考试名称、考试次数、最高分、是否通过与最近考试时间，并保留详情入口占位。"
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
    </MotionStagger>
  );
}
