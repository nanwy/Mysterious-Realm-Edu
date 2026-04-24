"use client";

import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import {
  Button,
  EmptyState,
  Field,
  FieldLabel,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SurfaceCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { ResultsPagination } from "../../common/results-pagination";
import {
  normalizeScoreError,
  SCORE_PASS_OPTIONS,
  SCORE_PASS_STATE,
  scoreQueryOptions,
} from "@/core/scores";
import type {
  ScoreDetailsFiltersState,
  ScorePassFilter,
} from "@/core/scores";

const createQueryString = (filters: ScoreDetailsFiltersState) => {
  const params = new URLSearchParams();

  if (filters.pageNo > 1) {
    params.set("page", String(filters.pageNo));
  }

  if (filters.passed !== SCORE_PASS_STATE.ALL) {
    params.set("passed", filters.passed);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

const getPassedSummary = (value: ScorePassFilter) =>
  SCORE_PASS_OPTIONS.find((item) => item.value === value)?.label ?? "全部成绩";

const renderPassedLabel = (value: boolean | null) => {
  if (value === true) {
    return (
      <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        通过
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="inline-flex rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
        未通过
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
      未知
    </span>
  );
};

export const ScoreDetailsPage = ({
  examId,
  initialFilters,
}: {
  examId: string;
  initialFilters: ScoreDetailsFiltersState;
}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const detailsQuery = useQuery(scoreQueryOptions.details(examId, initialFilters));
  const records = detailsQuery.data?.records ?? [];
  const total = detailsQuery.data?.total ?? 0;
  const error = detailsQuery.error
    ? normalizeScoreError(detailsQuery.error)
    : null;
  const isBusy = detailsQuery.isLoading || isPending;
  const totalPages = Math.max(1, Math.ceil(total / initialFilters.pageSize));

  const form = useForm({
    defaultValues: initialFilters,
    onSubmit: ({ value }) => {
      navigate({
        ...value,
        pageNo: 1,
      });
    },
  });

  useEffect(() => {
    form.reset(initialFilters);
  }, [form, initialFilters]);

  const navigate = (nextFilters: ScoreDetailsFiltersState) => {
    startTransition(() => {
      router.push(`${pathname}${createQueryString(nextFilters)}`, {
        scroll: false,
      });
    });
  };

  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Score Details"
          title="考试成绩明细"
          description="按考试维度查看成绩明细，支持是否通过筛选、分页浏览，以及接口失败时的明确说明。"
        >
          <div className="grid gap-6" data-testid="score-details-filter-section">
            <div className="grid gap-4 md:grid-cols-3">
              <MotionReveal direction="up" delay={0.02}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <p className="text-sm text-muted-foreground">考试 ID</p>
                  <p className="mt-3 text-xl font-semibold text-foreground">
                    {examId}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    当前明细页使用路由参数中的考试标识请求真实接口。
                  </p>
                </div>
              </MotionReveal>
              <MotionReveal direction="up" delay={0.08}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <p className="text-sm text-muted-foreground">筛选状态</p>
                  <p className="mt-3 text-xl font-semibold text-foreground">
                    {getPassedSummary(initialFilters.passed)}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    切页时会保留当前筛选条件。
                  </p>
                </div>
              </MotionReveal>
              <MotionReveal direction="up" delay={0.14}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <p className="text-sm text-muted-foreground">接口状态</p>
                  <p className="mt-3 text-xl font-semibold text-foreground">
                    {error ? "请求失败" : detailsQuery.isSuccess ? "已加载" : "准备中"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {error ?? "接口返回后会在下方渲染考试时间、交卷时间、得分和是否通过。"}
                  </p>
                </div>
              </MotionReveal>
            </div>

            <form
              className="grid gap-4 lg:grid-cols-[220px_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                void form.handleSubmit();
              }}
            >
              <form.Field name="passed">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="score-details-passed">
                      是否通过
                    </FieldLabel>
                    <Select
                      items={SCORE_PASS_OPTIONS}
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(value as ScorePassFilter)
                      }
                    >
                      <SelectTrigger id="score-details-passed">
                        <SelectValue placeholder="全部" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>是否通过</SelectLabel>
                          {SCORE_PASS_OPTIONS.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>

              <div className="flex flex-wrap items-end gap-3">
                <Button size="lg" type="submit" disabled={isBusy}>
                  查询
                </Button>
                <Button
                  size="lg"
                  type="button"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() =>
                    navigate({
                      ...initialFilters,
                      passed: SCORE_PASS_STATE.ALL,
                      pageNo: 1,
                    })
                  }
                >
                  清空
                </Button>
              </div>
            </form>
          </div>
        </SurfaceCard>
      </MotionItem>

      <MotionItem>
        <SurfaceCard
          title="成绩明细结果"
          description="结果覆盖考试名称、考试时间、交卷时间、考试用时、得分、及格分、阅卷状态与是否通过。"
        >
          <div className="grid gap-4" data-testid="score-details-results-section">
            {isBusy ? (
              <div className="grid gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-[24px] border border-border bg-muted/50"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="grid gap-5">
                <EmptyState
                  title="成绩明细接口暂不可用"
                  description={`当前无法加载考试成绩明细：${error}。请确认已登录且接口环境可访问后重试。`}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-fit"
                  onClick={() => {
                    void detailsQuery.refetch();
                  }}
                >
                  重新请求当前明细
                </Button>
              </div>
            ) : records.length === 0 ? (
              <EmptyState
                title="暂无匹配明细"
                description="该考试在当前筛选条件下没有查到成绩明细，可以切换通过状态后再试。"
              />
            ) : (
              <MotionStagger className="grid gap-4" delayChildren={0.06}>
                <MotionItem className="hidden overflow-hidden rounded-[24px] border border-border md:block">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="px-4">考试名称</TableHead>
                        <TableHead>考试时间</TableHead>
                        <TableHead>交卷时间</TableHead>
                        <TableHead>考试用时</TableHead>
                        <TableHead>得分</TableHead>
                        <TableHead>及格分</TableHead>
                        <TableHead>阅卷状态</TableHead>
                        <TableHead className="px-4">是否通过</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow key={record.id} className="bg-background/80">
                          <TableCell className="whitespace-normal px-4 py-4 font-medium text-foreground">
                            {record.examTitle}
                          </TableCell>
                          <TableCell className="py-4 text-muted-foreground">
                            {record.createTime}
                          </TableCell>
                          <TableCell className="py-4 text-muted-foreground">
                            {record.commitTime}
                          </TableCell>
                          <TableCell className="py-4 text-muted-foreground">
                            {record.userTime}
                          </TableCell>
                          <TableCell className="py-4 text-muted-foreground">
                            {record.userScore}
                          </TableCell>
                          <TableCell className="py-4 text-muted-foreground">
                            {record.qualifyScore}
                          </TableCell>
                          <TableCell className="py-4 text-muted-foreground">
                            {record.stateLabel}
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            {renderPassedLabel(record.passed)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </MotionItem>

                <div className="grid gap-3 md:hidden">
                  {records.map((record) => (
                    <MotionItem
                      key={record.id}
                      className="rounded-[24px] border border-border bg-background/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-foreground">
                            {record.examTitle}
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            考试时间：{record.createTime}
                          </p>
                        </div>
                        {renderPassedLabel(record.passed)}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-[20px] bg-muted/50 p-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            交卷时间
                          </p>
                          <p className="mt-2 text-base font-semibold text-foreground">
                            {record.commitTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            考试用时
                          </p>
                          <p className="mt-2 text-base font-semibold text-foreground">
                            {record.userTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            得分
                          </p>
                          <p className="mt-2 text-base font-semibold text-foreground">
                            {record.userScore}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            及格分
                          </p>
                          <p className="mt-2 text-base font-semibold text-foreground">
                            {record.qualifyScore}
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground">
                        阅卷状态：{record.stateLabel}
                      </p>
                    </MotionItem>
                  ))}
                </div>
              </MotionStagger>
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
            pending={isBusy}
            itemLabel="条明细"
            onPageChange={(page) =>
              navigate({
                ...initialFilters,
                pageNo: page,
              })
            }
          />
        </MotionReveal>
      </MotionItem>
    </MotionStagger>
  );
};
