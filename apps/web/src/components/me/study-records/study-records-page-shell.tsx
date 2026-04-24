"use client";

import { useForm } from "@tanstack/react-form";
import { getStudyProcessList, unwrapEnvelope } from "@workspace/api";
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
} from "@workspace/ui";
import {
  AlertCircle,
  BookCheck,
  BookOpenCheck,
  Clock3,
  RefreshCcw,
  Search,
  Waypoints,
} from "lucide-react";
import { startTransition, useEffect, useMemo, useState } from "react";
import { ResultsPagination } from "@/components/common/results-pagination";
import { toNumberOrFallback, toRecordOrEmpty, toText } from "@/lib/normalize";

interface StudyRecordsQuery {
  keyword: string;
  taskKeyword: string;
  pageNo: number;
  pageSize: number;
}

interface StudyRecordItem {
  id: string;
  courseName: string;
  taskName: string;
  totalLearnSeconds: number;
  totalLearnLabel: string;
  progressRatio: number;
  progressLabel: string;
  recentLearnTime: string;
  recentLearnHint: string;
  learningSignal: string;
}

interface StudyRecordsPayload {
  records: unknown[];
  total: number;
}

interface StudyRecordsResult {
  records: StudyRecordItem[];
  total: number;
}

interface StudyRecordsDataUtils {
  hasActiveFilters(query: Pick<StudyRecordsQuery, "keyword" | "taskKeyword">): boolean;
  filterRecords(
    records: StudyRecordItem[],
    query: Pick<StudyRecordsQuery, "keyword" | "taskKeyword">
  ): StudyRecordItem[];
  paginateRecords(records: StudyRecordItem[], pageNo: number, pageSize: number): StudyRecordsResult;
  filterAndPaginate(records: StudyRecordItem[], query: StudyRecordsQuery): StudyRecordsResult;
}

type RequestStudyRecordsPage = (query: StudyRecordsQuery) => Promise<StudyRecordsResult>;
type FetchHydratedStudyRecords = (
  query: StudyRecordsQuery,
  requestPage: RequestStudyRecordsPage
) => Promise<StudyRecordsResult>;

const DEFAULT_QUERY: StudyRecordsQuery = {
  keyword: "",
  taskKeyword: "",
  pageNo: 1,
  pageSize: 10,
};

function getErrorMessage(error: unknown) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "学习记录接口暂时不可用，请稍后重试。";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，已切换到页面兜底内容。`;
  }

  if (message === "网络请求失败") {
    return "学习记录接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
}

function clampProgress(value: unknown) {
  const numeric = toNumberOrFallback(value, 0);

  if (numeric <= 0) {
    return 0;
  }

  if (numeric <= 1) {
    return numeric;
  }

  if (numeric <= 100) {
    return numeric / 100;
  }

  return 1;
}

function formatDuration(seconds: number) {
  if (seconds <= 0) {
    return "尚未累计学习时长";
  }

  if (seconds < 60) {
    return `${seconds} 秒`;
  }

  const totalMinutes = Math.floor(seconds / 60);

  if (totalMinutes < 60) {
    return `${totalMinutes} 分钟`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} 小时`;
  }

  return `${hours} 小时 ${minutes} 分钟`;
}

function normalizeStudyRecord(item: unknown, index: number): StudyRecordItem {
  const record = toRecordOrEmpty(item);
  const totalLearnSeconds = toNumberOrFallback(
    record.totalLearnTime ?? record.learnTime ?? record.studyTime,
    0
  );
  const progressRatio = clampProgress(record.learnProcess ?? record.studyProcess ?? record.progress);
  const recentLearnTime =
    toText(record.lastLearnTime) ||
    toText(record.recentTime) ||
    toText(record.updateTime) ||
    "暂无最近学习记录";
  const taskName =
    toText(record.taskName) ||
    toText(record.latestTaskName) ||
    toText(record.catalogName) ||
    toText(record.chapterName) ||
    "接口暂未返回任务名称";

  let learningSignal = "可继续沿当前章节推进";

  if (progressRatio >= 1) {
    learningSignal = "课程学习已完成，可回看重点章节";
  } else if (taskName !== "接口暂未返回任务名称") {
    learningSignal = `下一步：${taskName}`;
  }

  return {
    id: String(record.id ?? record.userCatalogId ?? record.courseId ?? `study-record-${index + 1}`),
    courseName:
      toText(record.courseName) ||
      toText(record.goodsName) ||
      toText(record.title) ||
      `课程 ${index + 1}`,
    taskName,
    totalLearnSeconds,
    totalLearnLabel: formatDuration(totalLearnSeconds),
    progressRatio,
    progressLabel: progressRatio >= 1 ? "已完成" : `${Math.round(progressRatio * 100)}%`,
    recentLearnTime,
    recentLearnHint:
      recentLearnTime === "暂无最近学习记录"
        ? "接口尚未返回最近学习时间。"
        : "记录来源于接口返回的最近学习时间字段。",
    learningSignal,
  };
}

function toStudyRecordsPayload(value: unknown): StudyRecordsPayload {
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
  const total = toNumberOrFallback(
    payload.total ?? payload.count ?? payload.totalCount ?? payload.recordTotal,
    records.length
  );

  return {
    records,
    total,
  };
}

// BEGIN_STUDY_RECORDS_DATA_UTILS
const studyRecordsDataUtils: StudyRecordsDataUtils = {
  hasActiveFilters(query) {
    return Boolean(query.keyword.trim() || query.taskKeyword.trim());
  },
  filterRecords(records, query) {
    const keyword = query.keyword.trim();
    const taskKeyword = query.taskKeyword.trim();

    return records.filter((record) => {
      const matchesCourse = keyword ? record.courseName.includes(keyword) : true;
      const matchesTask = taskKeyword ? record.taskName.includes(taskKeyword) : true;

      return matchesCourse && matchesTask;
    });
  },
  paginateRecords(records, pageNo, pageSize) {
    const safePageSize = Math.max(pageSize, 1);
    const total = records.length;
    const pageCount = Math.max(1, Math.ceil(total / safePageSize));
    const safePage = Math.min(Math.max(pageNo, 1), pageCount);
    const startIndex = (safePage - 1) * safePageSize;

    return {
      records: records.slice(startIndex, startIndex + safePageSize),
      total,
    };
  },
  filterAndPaginate(records, query) {
    const filteredRecords = this.filterRecords(records, query);
    return this.paginateRecords(filteredRecords, query.pageNo, query.pageSize);
  },
};
// END_STUDY_RECORDS_DATA_UTILS

function createMockStudyRecords(query: StudyRecordsQuery) {
  const records: StudyRecordItem[] = [
    {
      id: "mock-study-record-1",
      courseName: "行政法基础精讲",
      taskName: "行政处罚程序与裁量",
      totalLearnSeconds: 3200,
      totalLearnLabel: formatDuration(3200),
      progressRatio: 0.64,
      progressLabel: "64%",
      recentLearnTime: "2026-04-23 19:20",
      recentLearnHint: "当前为接口异常兜底示例数据。",
      learningSignal: "下一步：行政处罚程序与裁量",
    },
    {
      id: "mock-study-record-2",
      courseName: "申论写作训练营",
      taskName: "综合分析题拆解",
      totalLearnSeconds: 5400,
      totalLearnLabel: formatDuration(5400),
      progressRatio: 0.92,
      progressLabel: "92%",
      recentLearnTime: "2026-04-22 21:05",
      recentLearnHint: "当前为接口异常兜底示例数据。",
      learningSignal: "下一步：综合分析题拆解",
    },
    {
      id: "mock-study-record-3",
      courseName: "公基高频考点冲刺",
      taskName: "宪法章节回顾",
      totalLearnSeconds: 7600,
      totalLearnLabel: formatDuration(7600),
      progressRatio: 1,
      progressLabel: "已完成",
      recentLearnTime: "2026-04-20 08:45",
      recentLearnHint: "当前为接口异常兜底示例数据。",
      learningSignal: "课程学习已完成，可回看重点章节",
    },
  ];

  return studyRecordsDataUtils.filterRecords(records, query);
}

async function requestStudyRecordsPage(query: StudyRecordsQuery): Promise<StudyRecordsResult> {
  const response = await getStudyProcessList({
    pageNo: query.pageNo,
    pageSize: query.pageSize,
    name: query.keyword.trim(),
    taskName: query.taskKeyword.trim(),
  });
  const result = toStudyRecordsPayload(unwrapEnvelope(response));

  return {
    records: result.records.map(normalizeStudyRecord),
    total: result.total,
  };
}

// BEGIN_FETCH_HYDRATED_STUDY_RECORDS
const fetchHydratedStudyRecords: FetchHydratedStudyRecords = async function (query, requestPage) {
  const collectorPageSize = Math.max(query.pageSize, 20);
  const firstPage = await requestPage({
    ...query,
    pageNo: 1,
    pageSize: collectorPageSize,
  });
  const totalPages = Math.max(1, Math.ceil(firstPage.total / collectorPageSize));
  const pageRequests = [];

  for (let page = 2; page <= totalPages; page += 1) {
    pageRequests.push(
      requestPage({
        ...query,
        pageNo: page,
        pageSize: collectorPageSize,
      })
    );
  }

  const remainingPages = await Promise.all(pageRequests);
  const hydratedRecords = [firstPage, ...remainingPages].flatMap((page) => page.records);

  return studyRecordsDataUtils.filterAndPaginate(hydratedRecords, query);
};
// END_FETCH_HYDRATED_STUDY_RECORDS

async function fetchStudyRecords(query: StudyRecordsQuery) {
  if (!studyRecordsDataUtils.hasActiveFilters(query)) {
    return requestStudyRecordsPage(query);
  }

  return fetchHydratedStudyRecords(query, requestStudyRecordsPage);
}

function StudyRecordsLoadingState() {
  return (
    <div className="grid gap-4" data-testid="study-records-loading">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[28px] border border-border/80 bg-card/90 p-5 shadow-[0_18px_48px_color-mix(in_oklab,var(--foreground)_6%,transparent)]"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton style={{ height: 20, width: 132, borderRadius: 999 }} />
            <Skeleton style={{ height: 20, width: 88, borderRadius: 999 }} />
          </div>
          <div className="mt-4">
            <Skeleton style={{ height: 32, width: "66.666667%", borderRadius: 999 }} />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Skeleton style={{ height: 88, borderRadius: 24 }} />
            <Skeleton style={{ height: 88, borderRadius: 24 }} />
            <Skeleton style={{ height: 88, borderRadius: 24 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StudyRecordsSearchForm({
  defaultValues,
  pending,
  onSubmit,
  onReset,
}: {
  defaultValues: Pick<StudyRecordsQuery, "keyword" | "taskKeyword">;
  pending: boolean;
  onSubmit: (value: Pick<StudyRecordsQuery, "keyword" | "taskKeyword">) => void;
  onReset: () => void;
}) {
  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => {
      onSubmit({
        keyword: value.keyword.trim(),
        taskKeyword: value.taskKeyword.trim(),
      });
    },
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <section data-testid="study-records-filter-section">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] xl:items-end">
          <form.Field name="keyword">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="study-records-keyword">课程名称</FieldLabel>
                <Input
                  id="study-records-keyword"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="输入课程名称，定位学习记录"
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="taskKeyword">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="study-records-task-keyword">任务名称</FieldLabel>
                <Input
                  id="study-records-task-keyword"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="输入任务名称，快速回看章节轨迹"
                />
              </Field>
            )}
          </form.Field>

          <div className="flex items-end">
            <Button type="submit" size="lg" disabled={pending}>
              <Search className="size-4" />
              查询记录
            </Button>
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={pending}
              onClick={() => {
                form.reset({ keyword: "", taskKeyword: "" });
                onReset();
              }}
            >
              重置
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}

function StudyRecordsOverview({
  records,
  total,
  query,
  isLoading,
  error,
  isFallback,
}: {
  records: StudyRecordItem[];
  total: number;
  query: StudyRecordsQuery;
  isLoading: boolean;
  error: string | null;
  isFallback: boolean;
}) {
  const learnedHours =
    records.length > 0
      ? (records.reduce((sum, record) => sum + record.totalLearnSeconds, 0) / 3600).toFixed(1)
      : "0.0";
  const completedCount = records.filter((record) => record.progressRatio >= 1).length;
  const recentRecord = records[0] ?? null;

  return (
    <div className="grid gap-4" data-testid="study-records-overview">
      <div className="rounded-[28px] border border-border/80 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--background)_96%,var(--primary)_4%),color-mix(in_oklab,var(--card)_88%,var(--primary)_12%))] p-5 shadow-[0_28px_80px_color-mix(in_oklab,var(--foreground)_8%,transparent)] md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Study Records</Badge>
          <span className="text-sm font-medium text-muted-foreground">旧版学习记录已迁入个人中心主线</span>
          {isFallback ? <Badge variant="outline">Fallback</Badge> : null}
        </div>
        <h2 className="mt-5 max-w-4xl text-[clamp(2rem,4vw,3.5rem)] font-black leading-[0.95] tracking-[-0.06em] text-foreground">
          把学习行为按时间线重新组织，
          <br />
          一眼确认最近学了什么、接下来该补什么。
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
          保留旧站“课程名称 + 任务名称筛选 + 分页”业务结构，并与 `/me` 风格统一，优先呈现课程、最近学习时间、学习时长与进度信号。
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
          <span className="rounded-full border border-border/70 bg-background/80 px-3 py-2">
            当前第 {query.pageNo} 页
          </span>
          <span className="rounded-full border border-border/70 bg-background/80 px-3 py-2">
            共 {total} 条记录
          </span>
          <span className="rounded-full border border-border/70 bg-background/80 px-3 py-2">
            {isLoading ? "正在同步学习记录" : error ? "学习记录同步异常" : "学习记录同步正常"}
          </span>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)]">
          <div className="rounded-[24px] border border-border/70 bg-background/82 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Recent Task</p>
            <p className="mt-3 text-xl font-black tracking-[-0.04em] text-foreground">
              {recentRecord ? recentRecord.taskName : "等待学习记录"}
            </p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {recentRecord
                ? `${recentRecord.courseName} · ${recentRecord.learningSignal}`
                : "当接口返回学习记录后，这里会优先提示最近一条学习行为。"}
            </p>
          </div>

          <div className="rounded-[24px] border border-border/70 bg-background/82 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Recent Learn</p>
            <p className="mt-3 text-lg font-black tracking-[-0.04em] text-foreground">
              {recentRecord ? recentRecord.recentLearnTime : "暂无同步时间"}
            </p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {recentRecord
                ? recentRecord.recentLearnHint
                : "接口返回最近学习时间后，会在这里显示同步状态。"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[24px] border border-border/70 bg-card/88 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">已完成记录</p>
          <p className="mt-3 text-[1.8rem] font-black tracking-[-0.05em] text-foreground">{completedCount}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">当前页进度达到 100% 的学习记录。</p>
        </div>

        <div className="rounded-[24px] border border-border/70 bg-card/88 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">已学时长</p>
          <p className="mt-3 text-[1.8rem] font-black tracking-[-0.05em] text-foreground">{learnedHours}h</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">当前页学习记录累计时长（小时）。</p>
        </div>

        <div className="rounded-[24px] border border-border/70 bg-card/88 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">筛选条件</p>
          <p className="mt-3 text-lg font-black tracking-[-0.03em] text-foreground">
            {query.keyword || query.taskKeyword ? "已启用" : "全部记录"}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {query.keyword || query.taskKeyword ? `课程「${query.keyword || "全部"}」 · 任务「${query.taskKeyword || "全部"}」` : "当前显示学习记录全量结果。"}
          </p>
        </div>
      </div>
    </div>
  );
}

function StudyRecordsList({ records, isFallback }: { records: StudyRecordItem[]; isFallback: boolean }) {
  return (
    <MotionStagger className="grid gap-4" delayChildren={0.06} data-testid="study-records-list">
      {records.map((record) => {
        const progressPercent = Math.round(record.progressRatio * 100);

        return (
          <MotionItem key={record.id}>
            <article className="overflow-hidden rounded-[28px] border border-border/80 bg-card/92 shadow-[0_22px_56px_color-mix(in_oklab,var(--foreground)_7%,transparent)]">
              <div className="grid gap-0 xl:grid-cols-[minmax(0,1.2fr)_320px]">
                <div className="p-5 md:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{record.progressLabel}</Badge>
                    <Badge variant="outline">{record.taskName}</Badge>
                    {isFallback ? <Badge variant="outline">示例兜底</Badge> : null}
                  </div>

                  <h3 className="mt-4 text-[1.55rem] font-black tracking-[-0.04em] text-foreground">{record.courseName}</h3>

                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      <span>Progress</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full border border-border/70 bg-muted/60">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-[22px] border border-border/70 bg-background/80 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <BookOpenCheck className="size-4 text-muted-foreground" />
                        任务名称
                      </div>
                      <p className="mt-3 text-lg font-bold tracking-[-0.03em] text-foreground">{record.taskName}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">学习记录返回的最近任务标识。</p>
                    </div>

                    <div className="rounded-[22px] border border-border/70 bg-background/80 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Clock3 className="size-4 text-muted-foreground" />
                        已学时长
                      </div>
                      <p className="mt-3 text-lg font-bold tracking-[-0.03em] text-foreground">{record.totalLearnLabel}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">课程累计学习时长来自接口字段。</p>
                    </div>

                    <div className="rounded-[22px] border border-border/70 bg-background/80 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Waypoints className="size-4 text-muted-foreground" />
                        最近学习
                      </div>
                      <p className="mt-3 text-lg font-bold tracking-[-0.03em] text-foreground">{record.recentLearnTime}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{record.recentLearnHint}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/70 bg-muted/28 p-5 xl:border-t-0 xl:border-l">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Record Status</p>
                  <dl className="mt-4 grid gap-4">
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">学习进度</dt>
                      <dd className="mt-1 text-sm font-semibold text-foreground">{record.progressLabel}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">学习信号</dt>
                      <dd className="mt-1 text-sm font-semibold text-foreground">{record.learningSignal}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">课程名称</dt>
                      <dd className="mt-1 text-sm font-semibold leading-6 text-foreground">{record.courseName}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </article>
          </MotionItem>
        );
      })}
    </MotionStagger>
  );
}

export function StudyRecordsPageShell() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [records, setRecords] = useState<StudyRecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);

    void fetchStudyRecords(query)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setRecords(result.records);
        setTotal(result.total);
        setError(null);
        setHasLoaded(true);
        setIsFallback(false);
        setIsLoading(false);
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        const fallbackRecords = createMockStudyRecords(query);

        setRecords(fallbackRecords);
        setTotal(fallbackRecords.length);
        setError(getErrorMessage(requestError));
        setHasLoaded(true);
        setIsFallback(true);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  function handleSearch(value: Pick<StudyRecordsQuery, "keyword" | "taskKeyword">) {
    startTransition(() => {
      setQuery((current) => ({
        ...current,
        keyword: value.keyword,
        taskKeyword: value.taskKeyword,
        pageNo: 1,
      }));
    });
  }

  function handleReset() {
    startTransition(() => {
      setQuery((current) => ({
        ...current,
        keyword: "",
        taskKeyword: "",
        pageNo: 1,
      }));
    });
  }

  function handleRetry() {
    startTransition(() => {
      setQuery((current) => ({ ...current }));
    });
  }

  function handlePageChange(page: number) {
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const safePage = Math.min(Math.max(page, 1), pageCount);

    startTransition(() => {
      setQuery((current) => ({
        ...current,
        pageNo: safePage,
      }));
    });
  }

  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const summaryDescription = useMemo(() => {
    if (error) {
      return isFallback
        ? "接口暂时不可用，已切换到兜底学习记录，保障页面可读和可操作。"
        : "当前无法读取学习记录，页面保留错误说明和重试入口。";
    }

    if (!hasLoaded || isLoading) {
      return "学习记录加载中，列表与统计区会在当前页面内同步刷新。";
    }

    if (records.length === 0) {
      if (query.keyword || query.taskKeyword) {
        return `没有匹配课程「${query.keyword || "全部"}」和任务「${query.taskKeyword || "全部"}」的学习记录。`;
      }

      return "当前账号还没有可展示的学习记录。";
    }

    return "列表按照学习记录聚合课程、任务、最近学习时间与学习进度信号。";
  }, [error, hasLoaded, isFallback, isLoading, query.keyword, query.taskKeyword, records.length]);

  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Study Records"
          title="学习记录"
          description="迁移旧版学习记录页到个人中心，并按当前设计语言重构为学习行为时间线工作台。"
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] xl:items-start">
            <MotionReveal direction="up" delay={0.03}>
              <StudyRecordsOverview
                records={records}
                total={total}
                query={query}
                isLoading={isLoading}
                error={error}
                isFallback={isFallback}
              />
            </MotionReveal>

            <MotionReveal direction="up" delay={0.08}>
              <div className="grid gap-4 rounded-[28px] border border-border/80 bg-card/88 p-5 shadow-[0_18px_48px_color-mix(in_oklab,var(--foreground)_6%,transparent)] md:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Filter</p>
                  <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-foreground">快速筛出需要复盘的学习轨迹</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    旧站保留课程和任务双筛选，这里延续业务结构，并在筛选区增加状态说明，减少来回切换成本。
                  </p>
                </div>

                <StudyRecordsSearchForm
                  defaultValues={{ keyword: query.keyword, taskKeyword: query.taskKeyword }}
                  pending={isLoading}
                  onSubmit={handleSearch}
                  onReset={handleReset}
                />

                <div className="grid gap-3 rounded-[24px] border border-dashed border-border/70 bg-background/70 p-4 text-sm leading-7 text-muted-foreground">
                  <p>{summaryDescription}</p>
                  <p>
                    当前分页：第 {query.pageNo} / {pageCount} 页，每页 {query.pageSize} 条。
                  </p>
                </div>
              </div>
            </MotionReveal>
          </div>
        </SurfaceCard>
      </MotionItem>

      <MotionItem>
        <SurfaceCard
          title="学习记录列表"
          description="列表区保留 loading / empty / error / pagination 四类状态。接口异常时显示可读错误并自动启用兜底记录。"
        >
          <div className="grid gap-6">
            <div data-testid="study-records-list-region">
              {!hasLoaded || isLoading ? (
                <StudyRecordsLoadingState />
              ) : error ? (
                <div className="grid gap-4">
                  <Alert>
                    <AlertCircle className="size-4" />
                    <AlertTitle>学习记录暂时不可用</AlertTitle>
                    <AlertDescription>
                      当前无法完整加载学习记录：{error}。页面已提供兜底记录，帮助你继续查看字段结构与分页行为。
                    </AlertDescription>
                  </Alert>
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" onClick={handleRetry}>
                      <RefreshCcw className="size-4" />
                      重试加载
                    </Button>
                  </div>
                  {records.length > 0 ? (
                    <StudyRecordsList records={records} isFallback={isFallback} />
                  ) : (
                    <EmptyState
                      title="当前筛选条件下没有可展示的兜底记录"
                      description="请清空筛选条件后重试，或等待接口恢复后查看真实学习记录。"
                    />
                  )}
                </div>
              ) : records.length === 0 ? (
                <EmptyState
                  title={query.keyword || query.taskKeyword ? "没有匹配的学习记录" : "当前还没有学习记录"}
                  description={
                    query.keyword || query.taskKeyword
                      ? "请调整课程或任务关键词，或重置筛选后查看全部结果。"
                      : "当课程产生学习行为后，这里会展示课程、任务、学习时长和最近学习时间。"
                  }
                />
              ) : (
                <StudyRecordsList records={records} isFallback={isFallback} />
              )}
            </div>

            <div data-testid="study-records-pagination">
              <ResultsPagination
                page={query.pageNo}
                pageCount={pageCount}
                total={total}
                pending={isLoading}
                itemLabel="条记录"
                onPageChange={handlePageChange}
              />
            </div>

            <div className="grid gap-3 rounded-[24px] border border-border/70 bg-muted/35 p-4 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 font-semibold text-foreground">
                <BookCheck className="size-4 text-muted-foreground" />
                字段兜底说明
              </p>
              <p>
                复用 `getStudyProcessList` 承接旧站学习记录结构。若接口未返回任务名、最近学习时间或学习时长，页面使用明确兜底文案，不渲染空白字段。
              </p>
            </div>
          </div>
        </SurfaceCard>
      </MotionItem>
    </MotionStagger>
  );
}
