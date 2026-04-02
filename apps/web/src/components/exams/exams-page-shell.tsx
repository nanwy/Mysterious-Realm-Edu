"use client";

import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge, SurfaceCard, Tabs, TabsList, TabsTrigger } from "@workspace/ui";
import { ResultsPagination } from "../common/results-pagination";
import { fetchExamList, normalizeExamError } from "./exams-data";
import { ExamsFilters } from "./exams-filters";
import { ExamsResults } from "./exams-results";
import {
  EXAMS_PAGE_SIZE,
  EXAM_STATUS_OPTIONS,
  EXAM_TYPE_OPTIONS,
  type ExamFiltersState,
  type ExamListItem,
  type ExamStatusFilter,
  type ExamTypeFilter,
} from "./exams-types";

function createQueryString(filters: ExamFiltersState) {
  const params = new URLSearchParams();

  if (filters.pageNo > 1) {
    params.set("page", String(filters.pageNo));
  }

  if (filters.examTitle.trim()) {
    params.set("keyword", filters.examTitle.trim());
  }

  if (filters.examType !== "1") {
    params.set("type", filters.examType);
  }

  if (filters.state) {
    params.set("status", filters.state);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

function getStatusSummary(status: ExamStatusFilter) {
  return EXAM_STATUS_OPTIONS.find((item) => item.value === status)?.label ?? "全部";
}

function getTypeSummary(type: ExamTypeFilter) {
  return EXAM_TYPE_OPTIONS.find((item) => item.value === type)?.label ?? "公开考试";
}

export function ExamsPageShell({ initialFilters }: { initialFilters: ExamFiltersState }) {
  const router = useRouter();
  const pathname = usePathname();
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [items, setItems] = useState<ExamListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
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

    void fetchExamList(initialFilters)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setItems(result.items);
        setTotal(result.total);
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        setItems([]);
        setTotal(0);
        setError(normalizeExamError(requestError));
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

  function navigate(nextFilters: ExamFiltersState) {
    setIsPending(true);
    setDraftFilters(nextFilters);
    startTransition(() => {
      router.push(`${pathname}${createQueryString(nextFilters)}`, { scroll: false });
    });
  }

  function updateType(nextType: string) {
    const examType = nextType === "2" ? "2" : "1";
    navigate({
      ...draftFilters,
      examType,
      pageNo: 1,
    });
  }

  function updateStatus(nextStatus: string) {
    const state = nextStatus === "0" || nextStatus === "2" || nextStatus === "3" ? nextStatus : "";
    navigate({
      ...draftFilters,
      state,
      pageNo: 1,
    });
  }

  function handleOpenExam(item: ExamListItem) {
    if (!item.examId) {
      return;
    }

    router.push(`/scores/${item.examId}`);
  }

  const totalPages = Math.max(1, Math.ceil(total / EXAMS_PAGE_SIZE));

  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Exam"
          title="考试列表"
          description="迁移旧 Vue 考试中心的双层筛选、搜索、结果列表与分页结构，继续使用 packages/api 的考试列表接口，并保留接口失败时的错误兜底。"
        >
          <div className="grid gap-6">
            <MotionReveal direction="up">
              <div className="grid gap-4 rounded-[28px] border border-border bg-muted/30 p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <div className="space-y-3">
                  <div className="w-fit">
                    <Badge>真实接口</Badge>
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">在线考试总览</h2>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                    保留公开考试与我的考试切换，支持按状态筛选、关键词检索和分页浏览。若服务未配置或接口失败，下方仅展示错误态。
                  </p>
                </div>
                <MotionStagger className="grid gap-3 sm:grid-cols-3" delayChildren={0.06}>
                  {[
                    { label: "考试类型", value: getTypeSummary(initialFilters.examType) },
                    { label: "筛选状态", value: getStatusSummary(initialFilters.state) },
                    {
                      label: "结果总数",
                      value: error ? "接口异常" : isLoading ? "加载中" : `${total} 条`,
                    },
                  ].map((item) => (
                    <MotionItem key={item.label}>
                      <div className="rounded-[24px] border border-border bg-background/80 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="mt-2 text-base font-semibold text-foreground">{item.value}</p>
                      </div>
                    </MotionItem>
                  ))}
                </MotionStagger>
              </div>
            </MotionReveal>

            <section data-testid="exams-tabs-section" className="grid gap-4">
              <div className="grid gap-2 rounded-[28px] border border-border bg-card/90 p-4 shadow-sm">
                <p className="text-sm font-medium text-foreground">考试类型</p>
                <div className="overflow-x-auto">
                  <Tabs value={draftFilters.examType} onValueChange={updateType}>
                    <TabsList aria-label="考试类型">
                      {EXAM_TYPE_OPTIONS.map((option) => (
                        <TabsTrigger key={option.value} value={option.value}>
                          {option.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              <div className="grid gap-2 rounded-[28px] border border-border bg-card/90 p-4 shadow-sm">
                <p className="text-sm font-medium text-foreground">考试状态</p>
                <div className="overflow-x-auto">
                  <Tabs value={draftFilters.state} onValueChange={updateStatus}>
                    <TabsList aria-label="考试状态">
                      {EXAM_STATUS_OPTIONS.map((option) => (
                        <TabsTrigger key={option.value || "all"} value={option.value}>
                          {option.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </section>

            <ExamsFilters
              defaultValues={draftFilters}
              pending={isPending}
              onSubmit={navigate}
              onReset={() =>
                navigate({
                  ...draftFilters,
                  examTitle: "",
                  pageNo: 1,
                })
              }
            />

            <ExamsResults
              items={items}
              loading={isLoading}
              error={error}
              onRetry={() => {
                setIsPending(false);
                setReloadVersion((value) => value + 1);
              }}
              onOpen={handleOpenExam}
            />

            <section
              data-testid="exams-pagination-section"
              className="grid gap-3 rounded-[28px] border border-border bg-card/90 p-4 shadow-sm"
            >
              <p className="text-sm text-muted-foreground">
                当前第{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(initialFilters.pageNo, totalPages)}
                </span>{" "}
                / {totalPages} 页，共{" "}
                <span className="font-semibold text-foreground">{total}</span> 场考试。
              </p>
              <ResultsPagination
                page={Math.min(initialFilters.pageNo, totalPages)}
                pageCount={totalPages}
                total={total}
                pending={isPending}
                itemLabel="场考试"
                onPageChange={(page) =>
                  navigate({
                    ...draftFilters,
                    pageNo: page,
                  })
                }
              />
            </section>
          </div>
        </SurfaceCard>
      </MotionItem>
    </MotionStagger>
  );
}
