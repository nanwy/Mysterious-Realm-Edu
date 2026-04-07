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
  return (
    EXAM_STATUS_OPTIONS.find((item) => item.value === status)?.label ?? "全部"
  );
}

function getTypeSummary(type: ExamTypeFilter) {
  return (
    EXAM_TYPE_OPTIONS.find((item) => item.value === type)?.label ?? "公开考试"
  );
}

export function ExamsPageShell({
  initialFilters,
}: {
  initialFilters: ExamFiltersState;
}) {
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
      router.push(`${pathname}${createQueryString(nextFilters)}`, {
        scroll: false,
      });
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
    const state =
      nextStatus === "0" || nextStatus === "2" || nextStatus === "3"
        ? nextStatus
        : "";
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

    router.push(`/exams/${item.examId}/preview`);
  }

  const totalPages = Math.max(1, Math.ceil(total / EXAMS_PAGE_SIZE));
  const currentPage = Math.min(draftFilters.pageNo, totalPages);
  const overviewItems = [
    {
      label: "当前类型",
      value: getTypeSummary(draftFilters.examType),
    },
    {
      label: "筛选状态",
      value: getStatusSummary(draftFilters.state),
    },
    {
      label: "结果总数",
      value: error ? "接口异常" : isLoading ? "加载中" : `${total} 条`,
    },
  ];

  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Exam"
          title="考试列表"
          description="迁移旧 Vue 考试中心的双层筛选、搜索、结果列表与分页结构，继续使用 packages/api 的考试列表接口，并保留接口失败时的错误兜底。"
        >
          <div className="grid gap-8 xl:grid-cols-[minmax(19rem,0.9fr)_minmax(0,1.5fr)] xl:items-start">
            <div className="grid gap-5 xl:sticky xl:top-6">
              <MotionReveal direction="up">
                <section className="grid gap-6 rounded-[32px] border border-border bg-muted/30 p-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge>真实接口</Badge>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        Exam center
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold text-foreground">
                        先确定筛选，再进入考试浏览
                      </h2>
                      <p className="text-sm leading-7 text-muted-foreground">
                        保留公开考试与我的考试切换、状态筛选、关键词检索和分页浏览，让首屏先聚焦筛选决策，再承接右侧结果浏览。
                      </p>
                    </div>
                  </div>

                  <MotionStagger className="grid gap-3" delayChildren={0.06}>
                    {overviewItems.map((item) => (
                      <MotionItem key={item.label}>
                        <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-3 last:border-b-0 last:pb-0">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {item.label}
                          </p>
                          <p className="text-right text-sm font-semibold text-foreground">
                            {item.value}
                          </p>
                        </div>
                      </MotionItem>
                    ))}
                  </MotionStagger>
                </section>
              </MotionReveal>

              <section
                data-testid="exams-tabs-section"
                className="grid gap-4 rounded-[32px] border border-border bg-card/80 p-5 shadow-sm"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">筛选条件</p>
                  <p className="text-sm text-muted-foreground">
                    先切换考试范围，再缩小到目标状态。
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-3 border-b border-border/70 pb-4">
                    <p className="text-sm font-medium text-foreground">
                      考试类型
                    </p>
                    <div className="overflow-x-auto">
                      <Tabs
                        value={draftFilters.examType}
                        onValueChange={updateType}
                      >
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

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">
                      考试状态
                    </p>
                    <div className="overflow-x-auto">
                      <Tabs
                        value={draftFilters.state}
                        onValueChange={updateStatus}
                      >
                        <TabsList aria-label="考试状态">
                          {EXAM_STATUS_OPTIONS.map((option) => (
                            <TabsTrigger
                              key={option.value || "all"}
                              value={option.value}
                            >
                              {option.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </Tabs>
                    </div>
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
            </div>

            <div className="grid gap-5">
              <MotionReveal direction="up">
                <section className="grid gap-3 rounded-[32px] border border-border bg-background/70 px-5 py-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        浏览区
                      </p>
                      <h3 className="text-xl font-semibold text-foreground">
                        按当前筛选查看考试结果
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      当前第{" "}
                      <span className="font-semibold text-foreground">
                        {currentPage}
                      </span>{" "}
                      / {totalPages} 页，共{" "}
                      <span className="font-semibold text-foreground">
                        {total}
                      </span>{" "}
                      场考试。
                    </p>
                  </div>
                </section>
              </MotionReveal>

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
                  向后翻页查看更多符合当前筛选的考试列表。
                </p>
                <ResultsPagination
                  page={currentPage}
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
          </div>
        </SurfaceCard>
      </MotionItem>
    </MotionStagger>
  );
}
