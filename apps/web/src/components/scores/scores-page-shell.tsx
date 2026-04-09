"use client";

import { createApiClient, unwrapEnvelope } from "@workspace/api";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge, EmptyState } from "@workspace/ui";
import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, CircleAlert, Clock3, ListFilter, Trophy } from "lucide-react";
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
  const heroStats = [
    {
      label: "结果总数",
      value: String(total),
      detail: "按当前筛选条件回传的成绩记录。",
      icon: Trophy,
    },
    {
      label: "当前视图",
      value: getPassedLabel(initialFilters.passed),
      detail: initialFilters.examTitle ? `关键词：${initialFilters.examTitle}` : "未限定考试名称。",
      icon: ListFilter,
    },
    {
      label: "接口状态",
      value: error ? "请求失败" : hasLoaded ? "已加载" : "准备中",
      detail: error ?? "接口返回成功后会在下方渲染真实成绩记录。",
      icon: CircleAlert,
    },
  ];
  const statusTimeline = [
    {
      label: "检索",
      detail: initialFilters.examTitle ? `锁定 ${initialFilters.examTitle}` : "未输入考试名称，浏览全部成绩。",
    },
    {
      label: "判断",
      detail: initialFilters.passed ? `当前只看 ${getPassedLabel(initialFilters.passed).replace("仅看", "")}` : "通过状态未限制，先看全量表现。",
    },
    {
      label: "进入明细",
      detail: "在结果区挑出需要复盘的一场，再进入单场详情。",
    },
  ];

  return (
    <MotionStagger className="flex flex-col gap-6" delayChildren={0.08}>
      <MotionItem>
        <section className="overflow-hidden rounded-[34px] border border-border bg-card/90 shadow-sm">
          <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(19rem,0.92fr)] lg:p-8">
            <div className="grid gap-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="rounded-full">Scores</Badge>
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    用户中心 / 成绩复盘
                  </span>
                </div>
                <div className="space-y-3">
                  <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    先判断哪场考试值得继续看，再进入单场成绩详情做复盘。
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                    这个页面不再只是把成绩表格摆出来，而是把筛选、状态判断和结果去向压成一条连续工作流，让学员先缩小范围，再决定进入哪场考试的详细记录。
                  </p>
                </div>
              </div>

              <MotionStagger className="grid gap-3 sm:grid-cols-3" delayChildren={0.08}>
                {heroStats.map((item) => {
                  const Icon = item.icon;

                  return (
                    <MotionItem key={item.label}>
                      <div className="rounded-[24px] border border-border/70 bg-background/75 px-4 py-4">
                        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                          <Icon className="size-4" />
                          <span>{item.label}</span>
                        </div>
                        <p className="mt-3 text-lg font-semibold text-foreground">{item.value}</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                      </div>
                    </MotionItem>
                  );
                })}
              </MotionStagger>

              <div className="grid gap-3 sm:grid-cols-3">
                {statusTimeline.map((item, index) => (
                  <div key={item.label} className="rounded-[24px] border border-border/60 bg-background/55 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-8 items-center justify-center rounded-full border border-border/70 bg-background text-xs font-semibold text-foreground">
                        0{index + 1}
                      </span>
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <MotionReveal
              direction="up"
              delay={0.04}
              className="rounded-[30px] border border-border/70 bg-background/78 p-5"
            >
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                      当前查询策略
                    </p>
                    <h3 className="text-xl font-semibold text-foreground">先缩小范围，再看考试详情</h3>
                    <p className="text-sm leading-7 text-muted-foreground">
                      当前视图会优先告诉你该不该继续点进某场考试，而不是把所有结果平铺成同权重表格。
                    </p>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {activeFilters.length ? `${activeFilters.length} 个条件` : "无额外筛选"}
                  </Badge>
                </div>

                <div className="grid gap-3">
                  {activeFilters.length ? (
                    activeFilters.map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between gap-3 rounded-[22px] border border-border/60 bg-card/70 px-4 py-3"
                      >
                        <span className="text-sm font-medium text-foreground">{item}</span>
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-border/70 bg-card/60 px-4 py-4 text-sm leading-7 text-muted-foreground">
                      当前正在浏览全部成绩。建议先输入考试名称或切换通过状态，快速定位需要复盘的那一场考试。
                    </div>
                  )}
                </div>

                <div className="rounded-[24px] border border-dashed border-border/70 bg-card/55 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <p className="text-sm leading-7 text-muted-foreground">
                      若登录态失效、环境未配置或接口异常，结果区会直接暴露真实错误，而不是显示看起来正常的静态假数据。
                    </p>
                  </div>
                </div>
              </div>
            </MotionReveal>
          </div>
          <div className="border-t border-border/70 bg-background/40 px-6 py-5 lg:px-8" data-testid="scores-filter-section">
            <div className="flex flex-col gap-3 pb-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Search</p>
                <h3 className="text-xl font-semibold text-foreground">快速筛出需要复盘的成绩</h3>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1.5">
                  关键词：{initialFilters.examTitle || "未筛选"}
                </span>
                <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1.5">
                  结果：{getPassedLabel(initialFilters.passed)}
                </span>
              </div>
            </div>
            <ScoresFilters
              filters={draftFilters}
              isLoading={isLoading || isPending}
              onChange={setDraftFilters}
              onQuery={handleQuery}
              onReset={handleReset}
            />
          </div>
        </section>
      </MotionItem>

      <MotionItem>
        <section className="rounded-[32px] border border-border bg-card/90 p-5 shadow-sm sm:p-6" data-testid="scores-results-section">
          <div className="grid gap-5">
            <div className="flex flex-col gap-4 border-b border-border/60 pb-5 xl:flex-row xl:items-end xl:justify-between">
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
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  结果区优先回答三个问题：这场考试是什么、我考了几次、现在值不值得点进详情页继续看。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[22px] border border-border/60 bg-background/65 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    分页规模
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    每页 {initialFilters.pageSize} 条
                  </p>
                </div>
                <div className="rounded-[22px] border border-border/60 bg-background/65 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    当前页码
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    第 {Math.min(initialFilters.pageNo, totalPages)} / {totalPages} 页
                  </p>
                </div>
                <div className="rounded-[22px] border border-border/60 bg-background/65 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    明细动作
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    支持进入单场成绩详情
                  </p>
                </div>
              </div>
            </div>

            {!hasLoaded || isLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-[24px] border border-border bg-muted/45"
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
        </section>
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
