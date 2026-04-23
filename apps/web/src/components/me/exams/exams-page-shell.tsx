"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { getExamList, getUserExamResultList, unwrapEnvelope } from "@workspace/api";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  EmptyState,
  Field,
  FieldLabel,
  Input,
  Skeleton,
  SurfaceCard,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@workspace/ui";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileSearch,
  ListFilter,
  RefreshCcw,
  Search,
} from "lucide-react";
import { ResultsPagination } from "@/components/common/results-pagination";
import { toDate, toNumberOrFallback, toRecordOrEmpty, toText } from "@/lib/normalize";

type ExamStateFilter = "" | "0" | "2" | "3";

interface MyExamQuery {
  keyword: string;
  state: ExamStateFilter;
  pageNo: number;
  pageSize: number;
  examType: "2";
}

interface MyExamRecord {
  id: string;
  examId: string;
  title: string;
  status: Exclude<ExamStateFilter, "">;
  statusLabel: string;
  timeText: string;
  durationText: string;
  attendeeText: string;
  summary: string;
  scoreText: string;
  resultTimeText: string;
  actionLabel: "进入考试" | "查看详情";
  actionHref: string | null;
  actionHint: string;
}

interface ExamListPayload {
  records: unknown[];
  total: number;
}

interface ResultBrief {
  scoreText: string;
  resultTimeText: string;
}

const PAGE_SIZE = 10;

const STATUS_TABS: Array<{
  value: ExamStateFilter;
  label: string;
  summary: string;
  emptyTitle: string;
  emptyDescription: string;
}> = [
  {
    value: "",
    label: "全部",
    summary: "汇总全部考试状态，优先确认近期要进入的考试与已结束考试详情入口。",
    emptyTitle: "当前没有考试安排",
    emptyDescription: "考试接口返回为空时会显示在这里，你可以重置筛选后再次检查。",
  },
  {
    value: "0",
    label: "进行中",
    summary: "聚焦当前可作答考试，保持“进入考试”入口可达。",
    emptyTitle: "当前没有进行中的考试",
    emptyDescription: "系统未返回进行中考试，可切换到全部或未开始确认后续安排。",
  },
  {
    value: "2",
    label: "未开始",
    summary: "提前查看未开始考试，确认开放时间与进入路径。",
    emptyTitle: "当前没有未开始考试",
    emptyDescription: "暂未检测到未开始考试，你可以稍后刷新或查看全部列表。",
  },
  {
    value: "3",
    label: "已结束",
    summary: "聚焦已结束考试并提供“查看详情”入口，便于回看成绩明细。",
    emptyTitle: "当前没有已结束考试",
    emptyDescription: "如果你刚结束考试但暂未看到记录，可能仍在成绩同步中。",
  },
];

const DEFAULT_QUERY: MyExamQuery = {
  keyword: "",
  state: "",
  pageNo: 1,
  pageSize: PAGE_SIZE,
  examType: "2",
};

function getTabMeta(state: ExamStateFilter) {
  return STATUS_TABS.find((item) => item.value === state) ?? STATUS_TABS[0];
}

function getErrorMessage(error: unknown) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "考试接口暂时不可用，请稍后重试。";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，当前只能展示错误说明。`;
  }

  if (message === "网络请求失败") {
    return "考试接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
}

function toListPayload(value: unknown): ExamListPayload {
  if (Array.isArray(value)) {
    return {
      records: value,
      total: value.length,
    };
  }

  const payload = toRecordOrEmpty(value);
  const records = Array.isArray(payload.records)
    ? payload.records
    : Array.isArray(payload.list)
      ? payload.list
      : Array.isArray(payload.rows)
        ? payload.rows
        : Array.isArray(payload.data)
          ? payload.data
          : [];

  return {
    records,
    total: toNumberOrFallback(
      payload.total ?? payload.count ?? payload.totalCount ?? payload.recordTotal,
      records.length
    ),
  };
}

function resolveStatus(record: Record<string, unknown>): Exclude<ExamStateFilter, ""> {
  const raw = toText(record.state ?? record.status ?? record.examStatus);

  if (raw === "0" || raw === "2" || raw === "3") {
    return raw;
  }

  const now = Date.now();
  const startAt = toDate(record.startTime ?? record.beginTime ?? record.examStartTime);
  const endAt = toDate(record.endTime ?? record.finishTime ?? record.examEndTime);

  if (startAt && now < startAt.getTime()) {
    return "2";
  }

  if (endAt && now > endAt.getTime()) {
    return "3";
  }

  return "0";
}

function getStatusLabel(status: Exclude<ExamStateFilter, "">) {
  if (status === "2") {
    return "未开始";
  }

  if (status === "3") {
    return "已结束";
  }

  return "进行中";
}

function formatDateText(value: unknown) {
  const date = toDate(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function buildTimeText(record: Record<string, unknown>) {
  const directText = toText(record.examTime ?? record.timeRange);

  if (directText) {
    return directText;
  }

  const startText = formatDateText(record.startTime ?? record.beginTime ?? record.examStartTime);
  const endText = formatDateText(record.endTime ?? record.finishTime ?? record.examEndTime);

  if (startText && endText) {
    return `${startText} - ${endText}`;
  }

  if (startText) {
    return `开始时间 ${startText}`;
  }

  if (endText) {
    return `结束时间 ${endText}`;
  }

  return "考试时间待公布";
}

function formatDurationText(value: unknown) {
  const text = toText(value);

  if (!text) {
    return "考试时长待同步";
  }

  if (text.includes("分钟") || text.includes("小时")) {
    return text;
  }

  return `${text} 分钟`;
}

function normalizeResultRecords(records: unknown[]) {
  const lookup = new Map<string, ResultBrief>();

  records.forEach((item, index) => {
    const record = toRecordOrEmpty(item);
    const examId = toText(record.examId ?? record.id);

    if (!examId || lookup.has(examId)) {
      return;
    }

    const userScore = toText(record.userScore ?? record.maxScore ?? record.score);
    const qualifyScore = toText(record.qualifyScore ?? record.passScore);
    const scoreText = userScore
      ? qualifyScore
        ? `${userScore} / ${qualifyScore}`
        : userScore
      : "成绩待同步";
    const resultTimeText =
      toText(record.commitTime ?? record.submitTime ?? record.updateTime ?? record.createTime) ||
      `考试记录 ${index + 1}`;

    lookup.set(examId, {
      scoreText,
      resultTimeText,
    });
  });

  return lookup;
}

function normalizeMyExamRecord(
  item: unknown,
  index: number,
  resultLookup: Map<string, ResultBrief>
): MyExamRecord {
  const record = toRecordOrEmpty(item);
  const examId = toText(record.examId ?? record.id ?? record.userExamId);
  const status = resolveStatus(record);
  const statusLabel = toText(record.state_dictText ?? record.statusName, getStatusLabel(status));
  const attendeeCount = toText(record.examNumber ?? record.joinNum ?? record.userCount ?? record.applyCount);
  const result = examId ? resultLookup.get(examId) : undefined;

  const actionLabel: "进入考试" | "查看详情" = status === "3" ? "查看详情" : "进入考试";
  const actionHref = examId
    ? status === "3"
      ? `/scores/${examId}`
      : `/exams/${examId}/preview`
    : null;

  return {
    id: toText(record.id ?? record.examId ?? record.userExamId, `my-exam-${index + 1}`),
    examId,
    title: toText(record.examName ?? record.title ?? record.name, `考试 ${index + 1}`),
    status,
    statusLabel,
    timeText: buildTimeText(record),
    durationText: formatDurationText(record.totalTime ?? record.examDuration ?? record.duration),
    attendeeText: attendeeCount ? `${attendeeCount} 人参与` : "参与人数待同步",
    summary:
      toText(record.examDesc ?? record.remark ?? record.description) ||
      (status === "3"
        ? "考试已结束，可进入详情查看成绩与提交记录。"
        : "请在考试开放时间内进入考试详情页并按规则完成作答。"),
    scoreText: result?.scoreText ?? "成绩待同步",
    resultTimeText: result?.resultTimeText ?? "暂未同步提交记录",
    actionLabel,
    actionHref,
    actionHint: actionHref
      ? status === "3"
        ? "查看考试详情（含成绩明细）"
        : "进入考试预览并继续作答流程"
      : "考试缺少可用 ID，当前仅展示状态信息，避免生成不可达入口。",
  };
}

async function fetchMyExams(query: MyExamQuery) {
  const [examListResult, userResultList] = await Promise.allSettled([
    getExamList({
      pageNo: query.pageNo,
      pageSize: query.pageSize,
      examTitle: query.keyword.trim(),
      state: query.state,
      examType: query.examType,
    }),
    getUserExamResultList({
      pageNo: 1,
      pageSize: 50,
      examTitle: query.keyword.trim(),
    }),
  ]);

  if (examListResult.status === "rejected") {
    throw examListResult.reason;
  }

  const examPayload = toListPayload(unwrapEnvelope(examListResult.value));
  const resultPayload =
    userResultList.status === "fulfilled"
      ? toListPayload(unwrapEnvelope(userResultList.value)).records
      : [];
  const resultLookup = normalizeResultRecords(resultPayload);

  return {
    records: examPayload.records.map((item, index) =>
      normalizeMyExamRecord(item, index, resultLookup)
    ),
    total: examPayload.total,
  };
}

function MyExamsLoadingState() {
  return (
    <div className="grid gap-4" data-testid="my-exams-loading">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[28px] border border-border/80 bg-card/90 p-5 shadow-[0_18px_48px_color-mix(in_oklab,var(--foreground)_6%,transparent)]"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton style={{ height: 20, width: 84, borderRadius: 999 }} />
            <Skeleton style={{ height: 20, width: 112, borderRadius: 999 }} />
          </div>
          <div className="mt-4">
            <Skeleton style={{ height: 30, width: "66.666667%", borderRadius: 999 }} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Skeleton style={{ height: 68, borderRadius: 20 }} />
            <Skeleton style={{ height: 68, borderRadius: 20 }} />
            <Skeleton style={{ height: 68, borderRadius: 20 }} />
          </div>
          <div className="mt-4">
            <Skeleton style={{ height: 16, width: "90%", borderRadius: 999 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MyExamSearchForm({
  defaultValues,
  pending,
  onSubmit,
  onReset,
}: {
  defaultValues: Pick<MyExamQuery, "keyword">;
  pending: boolean;
  onSubmit: (keyword: string) => void;
  onReset: () => void;
}) {
  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => {
      onSubmit(value.keyword.trim());
    },
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <form
      data-testid="my-exams-search-region"
      className="grid gap-3 rounded-[24px] border border-border/80 bg-card/90 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="keyword"
        children={(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>考试名称</FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              disabled={pending}
              placeholder="按考试名称检索"
              onBlur={field.handleBlur}
              onChange={(event) => {
                field.handleChange(event.target.value);
              }}
            />
          </Field>
        )}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          <Search />
          搜索
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            form.reset({ keyword: "" });
            onReset();
          }}
        >
          重置
        </Button>
      </div>
    </form>
  );
}

function StatusBadge({ status }: { status: Exclude<ExamStateFilter, ""> }) {
  if (status === "3") {
    return (
      <Badge>
        <CheckCircle2 />
        已结束
      </Badge>
    );
  }

  if (status === "2") {
    return (
      <Badge>
        <Clock3 />
        未开始
      </Badge>
    );
  }

  return (
    <Badge>
      <RefreshCcw />
      进行中
    </Badge>
  );
}

function MyExamList({ records }: { records: MyExamRecord[] }) {
  return (
    <MotionStagger className="grid gap-4" delayChildren={0.05} data-testid="my-exams-list-region">
      {records.map((record) => (
        <MotionItem key={record.id}>
          <article className="rounded-[28px] border border-border/80 bg-card/90 p-5 shadow-[0_18px_48px_color-mix(in_oklab,var(--foreground)_6%,transparent)]">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={record.status} />
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {record.statusLabel}
                  </p>
                </div>
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
                  {record.title}
                </h3>
              </div>
              <div className="rounded-2xl border border-border/80 bg-muted/45 px-3 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">考试编号</p>
                <p className="text-sm font-semibold text-foreground">
                  {record.examId || "待同步"}
                </p>
              </div>
            </header>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border/80 bg-muted/40 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">考试时间</p>
                <p className="mt-1 text-sm font-medium text-foreground">{record.timeText}</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-muted/40 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">考试信息</p>
                <p className="mt-1 text-sm font-medium text-foreground">{record.durationText}</p>
                <p className="mt-1 text-xs text-muted-foreground">{record.attendeeText}</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-muted/40 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">最近成绩</p>
                <p className="mt-1 text-sm font-medium text-foreground">{record.scoreText}</p>
                <p className="mt-1 text-xs text-muted-foreground">{record.resultTimeText}</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">{record.summary}</p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
              <p className="text-sm text-muted-foreground">{record.actionHint}</p>
              {record.actionHref ? (
                <Button asChild data-testid="my-exam-action-entry">
                  <Link href={record.actionHref}>
                    {record.actionLabel}
                    <ArrowRight />
                  </Link>
                </Button>
              ) : (
                <Button disabled data-testid="my-exam-action-entry">
                  {record.actionLabel}
                </Button>
              )}
            </div>
          </article>
        </MotionItem>
      ))}
    </MotionStagger>
  );
}

export function ExamsPageShell() {
  const [query, setQuery] = useState<MyExamQuery>(DEFAULT_QUERY);
  const [records, setRecords] = useState<MyExamRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    void fetchMyExams(query)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setRecords(result.records);
        setTotal(result.total);
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        setRecords([]);
        setTotal(0);
        setError(getErrorMessage(requestError));
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
  }, [query, reloadVersion]);

  const tabMeta = useMemo(() => getTabMeta(query.state), [query.state]);
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const currentPage = Math.min(query.pageNo, totalPages);

  function updateQuery(updater: (previous: MyExamQuery) => MyExamQuery) {
    setIsPending(true);
    startTransition(() => {
      setQuery((previous) => updater(previous));
    });
  }

  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="My Exams"
          title="我的考试"
          description="把待参加、进行中和已结束考试收拢到同一页，先判断状态，再进入考试或查看结果详情。"
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(19rem,0.92fr)_minmax(0,1.48fr)] xl:items-start">
            <div className="grid gap-5 xl:sticky xl:top-6">
              <MotionReveal direction="up">
                <section className="grid gap-5 rounded-[28px] border border-border/80 bg-muted/35 p-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>Exam Queue</Badge>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">/me/exams</p>
                    </div>
                    <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                      先筛选考试状态，再进入考试或查看详情
                    </h2>
                    <p className="text-sm leading-7 text-muted-foreground">{tabMeta.summary}</p>
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">筛选状态</p>
                      <p className="text-sm font-semibold text-foreground">{tabMeta.label}</p>
                    </div>
                    <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">结果总数</p>
                      <p className="text-sm font-semibold text-foreground">
                        {error ? "接口异常" : isLoading ? "加载中" : `${total} 条`}
                      </p>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">当前页</p>
                      <p className="text-sm font-semibold text-foreground">
                        {error ? "--" : `${currentPage} / ${totalPages}`}
                      </p>
                    </div>
                  </div>
                </section>
              </MotionReveal>

              <section
                data-testid="my-exams-filter-tabs"
                className="grid gap-3 rounded-[24px] border border-border/80 bg-card/90 p-5"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ListFilter className="size-4" />
                  考试状态
                </div>
                <div className="overflow-x-auto">
                  <Tabs
                    value={query.state}
                    onValueChange={(value) => {
                      const state = value === "0" || value === "2" || value === "3" ? value : "";
                      updateQuery((previous) => ({
                        ...previous,
                        state,
                        pageNo: 1,
                      }));
                    }}
                  >
                    <TabsList>
                      {STATUS_TABS.map((tab) => (
                        <TabsTrigger key={tab.value || "all"} value={tab.value}>
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </section>

              <MyExamSearchForm
                defaultValues={{ keyword: query.keyword }}
                pending={isPending}
                onSubmit={(keyword) => {
                  updateQuery((previous) => ({
                    ...previous,
                    keyword,
                    pageNo: 1,
                  }));
                }}
                onReset={() => {
                  updateQuery((previous) => ({
                    ...previous,
                    keyword: "",
                    pageNo: 1,
                  }));
                }}
              />
            </div>

            <div className="grid gap-4">
              {error ? (
                <Alert variant="destructive" data-testid="my-exams-error">
                  <AlertCircle />
                  <AlertTitle>考试列表加载失败</AlertTitle>
                  <AlertDescription>
                    <div className="grid gap-3">
                      <p>{error}</p>
                      <p>页面保留了筛选和刷新能力，接口恢复后可直接继续使用，不会回退为静态占位页。</p>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setIsPending(true);
                          setReloadVersion((value) => value + 1);
                        }}
                      >
                        <RefreshCcw />
                        重试
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : isLoading ? (
                <MyExamsLoadingState />
              ) : records.length === 0 ? (
                <EmptyState
                  icon={FileSearch}
                  title={tabMeta.emptyTitle}
                  description={tabMeta.emptyDescription}
                  data-testid="my-exams-empty"
                  actions={
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        updateQuery(() => DEFAULT_QUERY);
                      }}
                    >
                      <RefreshCcw />
                      重置筛选
                    </Button>
                  }
                />
              ) : (
                <>
                  <MyExamList records={records} />
                  <MotionReveal direction="up">
                    <section className="grid gap-3 rounded-[24px] border border-border/80 bg-card/90 p-5">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <CheckCircle2 className="size-4" />
                        入口可达说明
                      </div>
                      <div className="grid gap-2 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground">进入考试</span>
                          ：当状态为“进行中 / 未开始”且存在考试 ID 时，会跳转到考试预览页。
                        </p>
                        <p>
                          <span className="font-medium text-foreground">查看详情</span>
                          ：当状态为“已结束”时，会跳转到成绩详情页用于回看结果。
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock3 className="size-4" />
                          缺少考试 ID 的记录只展示状态说明，不生成不可达入口。
                        </p>
                      </div>
                    </section>
                  </MotionReveal>
                </>
              )}

              {!error && !isLoading && total > 0 ? (
                <ResultsPagination
                  page={currentPage}
                  pageCount={totalPages}
                  total={total}
                  itemLabel="场考试"
                  pending={isPending}
                  onPageChange={(pageNo) => {
                    updateQuery((previous) => ({
                      ...previous,
                      pageNo,
                    }));
                  }}
                />
              ) : null}
            </div>
          </div>
        </SurfaceCard>
      </MotionItem>
    </MotionStagger>
  );
}
