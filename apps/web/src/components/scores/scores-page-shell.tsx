"use client";

import { createApiClient, unwrapEnvelope } from "@workspace/api";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge, EmptyState, SurfaceCard } from "@workspace/ui";
import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, CircleAlert, ListFilter, Search, Trophy } from "lucide-react";
import { ResultsPagination } from "../common/results-pagination";
import { toBooleanOrNull, toNumberOrNull, toText } from "@/lib/normalize";
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
    tryCount: toNumberOrNull(record.tryCount),
    maxScore: toNumberOrNull(record.maxScore ?? record.score),
    passed: toBooleanOrNull(record.passed),
    recentExamTime: toText(record.updateTime ?? record.examTime ?? record.createTime),
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

function getPassedLabel(value: PassedFilter) {
  if (value === "1") {
    return "仅看通过";
  }

  if (value === "0") {
    return "仅看未通过";
  }

  return "全部结果";
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
  const activeFilters = [
    initialFilters.examTitle ? `考试名称：${initialFilters.examTitle}` : null,
    initialFilters.passed ? `通过状态：${getPassedLabel(initialFilters.passed)}` : null,
  ].filter(Boolean) as string[];
  const passedCount = records.filter((record) => record.passed === true).length;
  const retryCount = records.filter((record) => (record.tryCount ?? 0) > 1).length;
  const unresolvedCount = records.filter((record) => record.passed === null).length;

  return (
    <MotionStagger className="flex flex-col gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Scores"
          title="考试成绩查询"
          description="把旧版成绩查询重整成更清晰的成绩工作台：先确认接口状态，再围绕考试名称、通过状态和结果规模判断下一步要不要进入明细复盘。"
        >
          <div className="grid gap-8" data-testid="scores-filter-section">
            <div className="grid gap-8 border-b border-border/60 pb-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.9fr)]">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="w-fit rounded-full">真实接口</Badge>
                  <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    用户中心 / 成绩复盘
                  </span>
                </div>

                <div className="space-y-4">
                  <h2 className="max-w-4xl text-3xl font-semibold tracking-tight text-foreground sm:text-[2.35rem]">
                    先把需要复盘的考试圈出来，再决定要不要进入单场明细。
                  </h2>
                  <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                    这页优先帮助学员做筛选判断，而不是把所有成绩平权堆成表格。你可以先按考试名称和通过状态收窄范围，再根据分数、尝试次数和最近考试时间判断下一步。
                  </p>
                </div>

                <MotionStagger
                  className="grid gap-4 border-y border-border/60 py-4 sm:grid-cols-3"
                  delayChildren={0.08}
                >
                  <MotionItem>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                        <Trophy className="size-4" />
                        <span>结果总数</span>
                      </div>
                      <p className="text-2xl font-semibold tracking-tight text-foreground">{total}</p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        当前条件下可继续进入详情的考试记录。
                      </p>
                    </div>
                  </MotionItem>

                  <MotionItem>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                        <ListFilter className="size-4" />
                        <span>本页通过</span>
                      </div>
                      <p className="text-2xl font-semibold tracking-tight text-foreground">{passedCount}</p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {hasLoaded && !error
                          ? `其中 ${retryCount} 条属于多次尝试后的结果。`
                          : "数据返回后会汇总当前页的通过和重考情况。"}
                      </p>
                    </div>
                  </MotionItem>

                  <MotionItem>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                        <CircleAlert className="size-4" />
                        <span>接口状态</span>
                      </div>
                      <p className="text-2xl font-semibold tracking-tight text-foreground">
                        {error ? "请求失败" : hasLoaded ? "已加载" : "准备中"}
                      </p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {error
                          ? error
                          : unresolvedCount > 0
                            ? `有 ${unresolvedCount} 条记录仍待同步通过状态。`
                            : "当前结果区直接反映真实接口返回，不使用静态占位数据。"}
                      </p>
                    </div>
                  </MotionItem>
                </MotionStagger>
              </div>

              <aside className="flex h-full flex-col justify-between gap-6 border-l border-border/60 pl-0 xl:pl-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                        当前查询策略
                      </p>
                      <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                        先缩小范围，再看考试详情
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-full">
                      {activeFilters.length ? `${activeFilters.length} 个条件` : "默认视图"}
                    </Badge>
                  </div>

                  <div className="grid gap-3">
                    {activeFilters.length ? (
                      activeFilters.map((item) => (
                        <div key={item} className="border-b border-border/60 pb-3 text-sm text-foreground">
                          {item}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/25 px-4 py-4 text-sm leading-7 text-muted-foreground">
                        当前正在浏览全部成绩。建议先输入考试名称或切换通过状态，再决定要不要逐条查看。
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[22px] border border-border/60 bg-muted/25 px-4 py-4">
                  <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    <Search className="size-4" />
                    <span>使用建议</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    如果你只想找一场异常或低分考试，先用名称锁定考试，再切换到未通过视图，最后进入明细核对题型和提交结果。
                  </p>
                </div>
              </aside>
            </div>

            <ScoresFilters
              filters={draftFilters}
              isLoading={isLoading || isPending}
              onChange={setDraftFilters}
              onQuery={handleQuery}
              onReset={handleReset}
            />
          </div>
        </SurfaceCard>
      </MotionItem>

      <MotionItem>
        <SurfaceCard
          title="成绩结果"
          description="结果区优先回答三个问题：这场考试是什么、我考了几次、现在值不值得点进详情页继续看。"
        >
          <div data-testid="scores-results-section">
            <div className="mb-6 grid gap-4 border-b border-border/60 pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Results summary
                </p>
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                  {!hasLoaded || isLoading
                    ? "正在整理成绩结果"
                    : error
                      ? "结果区已切换为异常兜底"
                      : `已整理 ${total} 条成绩记录`}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground lg:justify-end">
                <span className="rounded-full border border-border/70 bg-muted/30 px-3 py-1.5">
                  每页 {initialFilters.pageSize} 条
                </span>
                <span className="rounded-full border border-border/70 bg-muted/30 px-3 py-1.5">
                  第 {Math.min(initialFilters.pageNo, totalPages)} / {totalPages} 页
                </span>
              </div>
            </div>

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
            className="inline-flex items-center gap-2 text-left text-sm text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => {
              setIsPending(false);
              setReloadVersion((value) => value + 1);
            }}
          >
            重新请求当前列表
            <ArrowUpRight className="size-4" />
          </button>
        </MotionItem>
      ) : null}
    </MotionStagger>
  );
}
