"use client";

import { createApiClient, unwrapEnvelope } from "@workspace/api";
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
import { useForm } from "@tanstack/react-form";
import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ResultsPagination } from "../common/results-pagination";

type PassedFilter = "" | "1" | "0";

interface ScoreDetailsFiltersState {
  passed: PassedFilter;
  pageNo: number;
  pageSize: number;
}

interface ScoreDetailRecord {
  id: string;
  examTitle: string;
  createTime: string;
  commitTime: string;
  userTime: string;
  userScore: string;
  qualifyScore: string;
  stateLabel: string;
  passed: boolean | null;
}

interface ScoreDetailsResponse {
  records?: unknown[];
  total?: number;
}

const client = createApiClient({
  getToken: () => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("token");
  },
});

function toRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function toText(value: unknown, fallback = "--") {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
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

function normalizeDetailRecord(item: unknown, index: number): ScoreDetailRecord {
  const record = toRecord(item);
  const identifier = record.id ?? record.userExamId ?? `score-detail-${index + 1}`;

  return {
    id: String(identifier),
    examTitle: toText(record.examTitle ?? record.title, `考试记录 ${index + 1}`),
    createTime: toText(record.createTime ?? record.examTime),
    commitTime: toText(record.commitTime ?? record.submitTime),
    userTime: toText(record.userTime ?? record.useTime),
    userScore: toText(record.userScore ?? record.score),
    qualifyScore: toText(record.qualifyScore ?? record.passScore),
    stateLabel: toText(record.state_dictText ?? record.stateText ?? record.state, "待同步"),
    passed: toBooleanValue(record.passed),
  };
}

function getErrorMessage(error: unknown) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "成绩明细接口暂时不可用，请稍后重试。";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，当前只能展示错误说明。`;
  }

  if (message === "网络请求失败") {
    return "成绩明细接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
}

function createQueryString(filters: ScoreDetailsFiltersState) {
  const params = new URLSearchParams();

  if (filters.pageNo > 1) {
    params.set("page", String(filters.pageNo));
  }

  if (filters.passed) {
    params.set("passed", filters.passed);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function fetchScoreDetails(examId: string, filters: ScoreDetailsFiltersState) {
  const response = await client.post<ScoreDetailsResponse>("/exam/userExamDetail/list", {
    examId,
    ...filters,
  });
  const payload = unwrapEnvelope(response);
  const result =
    payload && typeof payload === "object"
      ? (payload as ScoreDetailsResponse)
      : ({} as ScoreDetailsResponse);

  const records = Array.isArray(result.records) ? result.records.map(normalizeDetailRecord) : [];
  const total = typeof result.total === "number" ? result.total : records.length;

  return { records, total };
}

function renderPassedLabel(value: boolean | null) {
  if (value === true) {
    return (
      <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
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
}

export function ScoreDetailsPageShell({
  examId,
  initialFilters,
}: {
  examId: string;
  initialFilters: ScoreDetailsFiltersState;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [records, setRecords] = useState<ScoreDetailRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);

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

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    void fetchScoreDetails(examId, initialFilters)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setRecords(result.records);
        setTotal(result.total);
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
  }, [examId, initialFilters, reloadVersion]);

  function navigate(nextFilters: ScoreDetailsFiltersState) {
    setIsPending(true);
    startTransition(() => {
      router.push(`${pathname}${createQueryString(nextFilters)}`, { scroll: false });
    });
  }

  const totalPages = Math.max(1, Math.ceil(total / initialFilters.pageSize));

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
                  <p className="mt-3 text-xl font-semibold text-foreground">{examId}</p>
                  <p className="mt-2 text-sm text-muted-foreground">当前明细页使用路由参数中的考试标识请求真实接口。</p>
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
                  <p className="mt-2 text-sm text-muted-foreground">切页时会保留当前筛选条件。</p>
                </div>
              </MotionReveal>
              <MotionReveal direction="up" delay={0.14}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <p className="text-sm text-muted-foreground">接口状态</p>
                  <p className="mt-3 text-xl font-semibold text-foreground">
                    {error ? "请求失败" : hasLoaded ? "已加载" : "准备中"}
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
                    <FieldLabel htmlFor="score-details-passed">是否通过</FieldLabel>
                    <Select
                      items={[
                        { value: "", label: "全部" },
                        { value: "1", label: "通过" },
                        { value: "0", label: "未通过" },
                      ]}
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value as PassedFilter)}
                    >
                      <SelectTrigger id="score-details-passed">
                        <SelectValue placeholder="全部" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>是否通过</SelectLabel>
                          <SelectItem value="">全部</SelectItem>
                          <SelectItem value="1">通过</SelectItem>
                          <SelectItem value="0">未通过</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>

              <div className="flex flex-wrap items-end gap-3">
                <Button size="lg" type="submit" disabled={isLoading || isPending}>
                  查询
                </Button>
                <Button
                  size="lg"
                  type="button"
                  variant="outline"
                  disabled={isLoading || isPending}
                  onClick={() => navigate({ ...initialFilters, passed: "", pageNo: 1 })}
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
                title="成绩明细接口暂不可用"
                description={`当前无法加载考试成绩明细：${error}。请确认已登录且接口环境可访问后重试。`}
              />
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
                          <TableCell className="px-4 py-4 font-medium whitespace-normal text-foreground">
                            {record.examTitle}
                          </TableCell>
                          <TableCell className="py-4 text-muted-foreground">{record.createTime}</TableCell>
                          <TableCell className="py-4 text-muted-foreground">{record.commitTime}</TableCell>
                          <TableCell className="py-4 text-muted-foreground">{record.userTime}</TableCell>
                          <TableCell className="py-4 text-muted-foreground">{record.userScore}</TableCell>
                          <TableCell className="py-4 text-muted-foreground">{record.qualifyScore}</TableCell>
                          <TableCell className="py-4 text-muted-foreground">{record.stateLabel}</TableCell>
                          <TableCell className="px-4 py-4">{renderPassedLabel(record.passed)}</TableCell>
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
                          <p className="text-lg font-semibold text-foreground">{record.examTitle}</p>
                          <p className="mt-2 text-sm text-muted-foreground">考试时间：{record.createTime}</p>
                        </div>
                        {renderPassedLabel(record.passed)}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-[20px] bg-muted/50 p-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">交卷时间</p>
                          <p className="mt-2 text-base font-semibold text-foreground">{record.commitTime}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">考试用时</p>
                          <p className="mt-2 text-base font-semibold text-foreground">{record.userTime}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">得分</p>
                          <p className="mt-2 text-base font-semibold text-foreground">{record.userScore}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">及格分</p>
                          <p className="mt-2 text-base font-semibold text-foreground">{record.qualifyScore}</p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground">阅卷状态：{record.stateLabel}</p>
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
            pending={isLoading || isPending}
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
            重新请求当前明细
          </button>
        </MotionItem>
      ) : null}
    </MotionStagger>
  );
}
