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
  BookOpenCheck,
  Clock3,
  RefreshCcw,
  Search,
  Waypoints,
} from "lucide-react";
import { startTransition, useEffect, useMemo, useState } from "react";
import { ResultsPagination } from "@/components/common/results-pagination";
import { toNumberOrFallback, toRecordOrEmpty, toText } from "@/lib/normalize";

interface StudyProgressQuery {
  keyword: string;
  pageNo: number;
  pageSize: number;
}

interface StudyProgressRecord {
  id: string;
  courseName: string;
  progressRatio: number;
  progressLabel: string;
  totalLearnLabel: string;
  totalLearnSeconds: number;
  recentStudyLabel: string;
  recentStudyHint: string;
  pendingLabel: string;
  taskSummary: string | null;
}

interface StudyProgressPayload {
  records: unknown[];
  total: number;
}

const DEFAULT_QUERY: StudyProgressQuery = {
  keyword: "",
  pageNo: 1,
  pageSize: 10,
};

function getErrorMessage(error: unknown) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "学习进度接口暂时不可用，请稍后重试。";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，当前只能展示错误说明。`;
  }

  if (message === "网络请求失败") {
    return "学习进度接口暂时不可用，请检查服务是否启动或稍后重试。";
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

function getTaskSummary(record: Record<string, unknown>) {
  const completed = toNumberOrFallback(
    record.finishTaskNum ?? record.completedTaskNum ?? record.learnedTaskCount ?? record.finishCatalogNum,
    0
  );
  const total = toNumberOrFallback(
    record.taskNum ?? record.totalTaskNum ?? record.catalogNum ?? record.totalCatalogNum ?? record.chapterTotal,
    0
  );

  if (total <= 0) {
    return null;
  }

  const safeCompleted = Math.min(Math.max(completed, 0), total);
  return `${safeCompleted}/${total} 节`;
}

function normalizeStudyProgressRecord(item: unknown, index: number): StudyProgressRecord {
  const record = toRecordOrEmpty(item);
  const progressRatio = clampProgress(record.learnProcess ?? record.studyProcess ?? record.progress);
  const totalLearnSeconds = toNumberOrFallback(
    record.totalLearnTime ?? record.learnTime ?? record.studyTime,
    0
  );
  const pendingTask =
    toText(record.taskName) ||
    toText(record.latestTaskName) ||
    toText(record.catalogName) ||
    toText(record.chapterName);
  const recentStudyLabel =
    toText(record.recentTime) ||
    toText(record.updateTime) ||
    toText(record.lastStudyTime) ||
    "暂无最近学习记录";
  const taskSummary = getTaskSummary(record);
  const isComplete = progressRatio >= 1;
  const progressLabel = isComplete ? "已完成" : `${Math.round(progressRatio * 100)}%`;
  const recentStudyHint = recentStudyLabel === "暂无最近学习记录" ? "接口尚未返回最近学习时间。" : "最近一次学习同步时间。";
  let pendingLabel = "接口暂未返回待完成章节";

  if (isComplete) {
    pendingLabel = "课程已完成，可回看重点章节。";
  } else if (pendingTask) {
    pendingLabel = `待完成：${pendingTask}`;
  } else if (taskSummary) {
    pendingLabel = `当前已完成 ${taskSummary}`;
  }

  return {
    id: String(record.id ?? record.courseId ?? record.goodsId ?? `study-progress-${index + 1}`),
    courseName:
      toText(record.courseName) ||
      toText(record.goodsName) ||
      toText(record.title) ||
      `课程 ${index + 1}`,
    progressRatio,
    progressLabel,
    totalLearnLabel: formatDuration(totalLearnSeconds),
    totalLearnSeconds,
    recentStudyLabel,
    recentStudyHint,
    pendingLabel,
    taskSummary,
  };
}

function toStudyProgressPayload(value: unknown): StudyProgressPayload {
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
  const total =
    toNumberOrFallback(
      payload.total ?? payload.count ?? payload.totalCount ?? payload.recordTotal,
      records.length
    );

  return {
    records,
    total,
  };
}

async function fetchStudyProgress(query: StudyProgressQuery) {
  const response = await getStudyProcessList({
    pageNo: query.pageNo,
    pageSize: query.pageSize,
    name: query.keyword.trim(),
  });
  const result = toStudyProgressPayload(unwrapEnvelope(response));
  const records = result.records.map(normalizeStudyProgressRecord);

  return {
    records,
    total: result.total,
  };
}

function StudyProgressLoadingState() {
  return (
    <div className="grid gap-4" data-testid="study-progress-loading">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[28px] border border-border/80 bg-card/90 p-5 shadow-[0_18px_48px_color-mix(in_oklab,var(--foreground)_6%,transparent)]"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton style={{ height: 20, width: 112, borderRadius: 999 }} />
            <Skeleton style={{ height: 20, width: 80, borderRadius: 999 }} />
          </div>
          <div className="mt-4">
            <Skeleton style={{ height: 32, width: "66.666667%", borderRadius: 999 }} />
          </div>
          <div className="mt-5">
            <Skeleton style={{ height: 12, width: "100%", borderRadius: 999 }} />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Skeleton style={{ height: 80, borderRadius: 24 }} />
            <Skeleton style={{ height: 80, borderRadius: 24 }} />
            <Skeleton style={{ height: 80, borderRadius: 24 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StudyProgressSearchForm({
  defaultValues,
  pending,
  onSubmit,
  onReset,
}: {
  defaultValues: Pick<StudyProgressQuery, "keyword">;
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
    <section data-testid="study-progress-filter-section">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-end">
          <form.Field name="keyword">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="study-progress-keyword">课程名称</FieldLabel>
                <Input
                  id="study-progress-keyword"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="输入课程名称，收窄当前进度列表"
                />
              </Field>
            )}
          </form.Field>

          <div className="flex items-end">
            <Button type="submit" size="lg" disabled={pending}>
              <Search className="size-4" />
              查询课程
            </Button>
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={pending}
              onClick={() => {
                form.reset({ keyword: "" });
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

function StudyProgressOverview({
  records,
  total,
  query,
  isLoading,
  error,
}: {
  records: StudyProgressRecord[];
  total: number;
  query: StudyProgressQuery;
  isLoading: boolean;
  error: string | null;
}) {
  const finishedCount = records.filter((item) => item.progressRatio >= 1).length;
  const averageProgress =
    records.length > 0
      ? Math.round((records.reduce((sum, item) => sum + item.progressRatio, 0) / records.length) * 100)
      : 0;
  const learnedHours =
    records.length > 0
      ? (records.reduce((sum, item) => sum + item.totalLearnSeconds, 0) / 3600).toFixed(1)
      : "0.0";
  const featuredRecord = records.find((item) => item.progressRatio < 1) ?? records[0] ?? null;

  return (
    <div className="grid gap-4" data-testid="study-progress-overview">
      <div className="rounded-[28px] border border-border/80 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--background)_96%,var(--primary)_4%),color-mix(in_oklab,var(--card)_88%,var(--primary)_12%))] p-5 shadow-[0_28px_80px_color-mix(in_oklab,var(--foreground)_8%,transparent)] md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Study Process</Badge>
          <span className="text-sm font-medium text-muted-foreground">
            旧版学习进度页已迁入个人中心主线
          </span>
        </div>
        <h2 className="mt-5 max-w-4xl text-[clamp(2rem,4vw,3.5rem)] font-black leading-[0.95] tracking-[-0.06em] text-foreground">
          用课程维度重新整理学习推进，
          <br />
          先看完成度，再定位下一段要补的内容。
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
          保留旧站“课程名称筛选 + 分页列表”骨架，但把首屏改成学习驾驶舱：优先显示总体完成率、最近学习时间和待完成提示，减少反复进表查找。
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
          <span className="rounded-full border border-border/70 bg-background/80 px-3 py-2">
            当前第 {query.pageNo} 页
          </span>
          <span className="rounded-full border border-border/70 bg-background/80 px-3 py-2">
            共 {total} 门课程
          </span>
          <span className="rounded-full border border-border/70 bg-background/80 px-3 py-2">
            {isLoading ? "正在同步学习进度" : error ? "学习进度同步失败" : "学习进度同步正常"}
          </span>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)]">
          <div className="rounded-[24px] border border-border/70 bg-background/82 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Continue Next
            </p>
            <p className="mt-3 text-xl font-black tracking-[-0.04em] text-foreground">
              {featuredRecord ? featuredRecord.courseName : "等待课程学习记录"}
            </p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {featuredRecord
                ? featuredRecord.pendingLabel
                : "当接口返回课程学习进度后，这里会优先提示最值得继续的一门课。"}
            </p>
          </div>

          <div className="rounded-[24px] border border-border/70 bg-background/82 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Recent Sync
            </p>
            <p className="mt-3 text-lg font-black tracking-[-0.04em] text-foreground">
              {featuredRecord ? featuredRecord.recentStudyLabel : "暂无同步时间"}
            </p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {featuredRecord
                ? featuredRecord.recentStudyHint
                : "接口一旦返回最近学习时间，会在这里提示同步节奏。"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[24px] border border-border/70 bg-card/88 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            已完成课程
          </p>
          <p className="mt-3 text-[1.8rem] font-black tracking-[-0.05em] text-foreground">
            {finishedCount}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            当前页中进度达到 100% 的课程数量。
          </p>
        </div>

        <div className="rounded-[24px] border border-border/70 bg-card/88 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            平均完成率
          </p>
          <p className="mt-3 text-[1.8rem] font-black tracking-[-0.05em] text-foreground">
            {averageProgress}%
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            仅基于当前页课程计算，方便快速判断本页整体推进节奏。
          </p>
        </div>

        <div className="rounded-[24px] border border-border/70 bg-card/88 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            已学时长
          </p>
          <p className="mt-3 text-[1.8rem] font-black tracking-[-0.05em] text-foreground">
            {learnedHours}h
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            当前页课程累计已学时长，便于估算本轮学习投入。
          </p>
        </div>
      </div>
    </div>
  );
}

function StudyProgressList({ records }: { records: StudyProgressRecord[] }) {
  return (
    <MotionStagger className="grid gap-4" delayChildren={0.06} data-testid="study-progress-list">
      {records.map((record) => {
        const progressPercent = Math.round(record.progressRatio * 100);

        return (
          <MotionItem key={record.id}>
            <article className="overflow-hidden rounded-[28px] border border-border/80 bg-card/92 shadow-[0_22px_56px_color-mix(in_oklab,var(--foreground)_7%,transparent)]">
              <div className="grid gap-0 xl:grid-cols-[minmax(0,1.2fr)_320px]">
                <div className="p-5 md:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{record.progressLabel}</Badge>
                    {record.taskSummary ? <Badge variant="outline">{record.taskSummary}</Badge> : null}
                  </div>

                  <h3 className="mt-4 text-[1.55rem] font-black tracking-[-0.04em] text-foreground">
                    {record.courseName}
                  </h3>

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
                        <Clock3 className="size-4 text-muted-foreground" />
                        已学时长
                      </div>
                      <p className="mt-3 text-lg font-bold tracking-[-0.03em] text-foreground">
                        {record.totalLearnLabel}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        课程累计学习时长来自学习进度接口。
                      </p>
                    </div>

                    <div className="rounded-[22px] border border-border/70 bg-background/80 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Waypoints className="size-4 text-muted-foreground" />
                        最近学习
                      </div>
                      <p className="mt-3 text-lg font-bold tracking-[-0.03em] text-foreground">
                        {record.recentStudyLabel}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {record.recentStudyHint}
                      </p>
                    </div>

                    <div className="rounded-[22px] border border-border/70 bg-background/80 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <BookOpenCheck className="size-4 text-muted-foreground" />
                        下一步提示
                      </div>
                      <p className="mt-3 text-lg font-bold tracking-[-0.03em] text-foreground">
                        {record.pendingLabel}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        若接口未返回章节字段，这里会明确降级说明，不捏造待学内容。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/70 bg-muted/28 p-5 xl:border-t-0 xl:border-l">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Course Status
                  </p>
                  <dl className="mt-4 grid gap-4">
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">完成率</dt>
                      <dd className="mt-1 text-sm font-semibold text-foreground">
                        {record.progressLabel}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">学习节奏</dt>
                      <dd className="mt-1 text-sm font-semibold text-foreground">
                        {record.taskSummary ? `已完成 ${record.taskSummary}` : "接口未返回章节总量"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">待完成提示</dt>
                      <dd className="mt-1 text-sm font-semibold leading-6 text-foreground">
                        {record.pendingLabel}
                      </dd>
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

export function StudyProgressPageShell() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [records, setRecords] = useState<StudyProgressRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);

    void fetchStudyProgress(query)
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
  }, [query]);

  function handleSearch(keyword: string) {
    startTransition(() => {
      setQuery((current) => ({
        ...current,
        keyword,
        pageNo: 1,
      }));
    });
  }

  function handleReset() {
    startTransition(() => {
      setQuery((current) => ({
        ...current,
        keyword: "",
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
      return "当前无法读取学习进度，页面保留错误说明和重试入口。";
    }

    if (!hasLoaded || isLoading) {
      return "学习进度加载中，列表和统计区会在当前页面内同步刷新。";
    }

    if (records.length === 0) {
      return query.keyword
        ? `没有找到和“${query.keyword}”相关的课程进度。`
        : "当前账号还没有可展示的课程学习进度。";
    }

    return "列表按课程聚合学习进度，保留最近学习提示、已学时长和章节级降级说明。";
  }, [error, hasLoaded, isLoading, query.keyword, records.length]);

  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Study Progress"
          title="学习进度"
          description="迁移旧版学习进度页到个人中心，并按当前设计语言重构为课程推进工作台。"
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] xl:items-start">
            <MotionReveal direction="up" delay={0.03}>
              <StudyProgressOverview
                records={records}
                total={total}
                query={query}
                isLoading={isLoading}
                error={error}
              />
            </MotionReveal>

            <MotionReveal direction="up" delay={0.08}>
              <div className="grid gap-4 rounded-[28px] border border-border/80 bg-card/88 p-5 shadow-[0_18px_48px_color-mix(in_oklab,var(--foreground)_6%,transparent)] md:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Filter
                  </p>
                  <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-foreground">
                    快速收窄当前学习主线
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    旧站只有课程名检索，这里保留同样的业务入口，但补上状态说明，让筛选区本身也承担判断作用。
                  </p>
                </div>

                <StudyProgressSearchForm
                  defaultValues={{ keyword: query.keyword }}
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
          title="课程进度列表"
          description="列表区保留 loading / empty / error / pagination 四类状态。接口字段不足时仅做信息降级，不补虚构章节。"
        >
          <div className="grid gap-6">
            <div data-testid="study-progress-list-region">
              {!hasLoaded || isLoading ? (
                <StudyProgressLoadingState />
              ) : error ? (
                <div className="grid gap-4">
                  <Alert>
                    <AlertCircle className="size-4" />
                    <AlertTitle>学习进度暂时不可用</AlertTitle>
                    <AlertDescription>
                      当前无法加载学习进度：{error}
                      。请确认已登录且接口环境可访问后重试。
                    </AlertDescription>
                  </Alert>
                  <div>
                    <Button type="button" onClick={handleRetry}>
                      <RefreshCcw className="size-4" />
                      重试加载
                    </Button>
                  </div>
                </div>
              ) : records.length === 0 ? (
                <EmptyState
                  title={query.keyword ? "没有匹配的课程进度" : "当前还没有学习进度"}
                  description={
                    query.keyword
                      ? `请更换课程名称关键词，或清空筛选后查看全部课程。`
                      : "当课程产生学习记录后，这里会按课程维度汇总完成率、最近学习时间和待完成提示。"
                  }
                />
              ) : (
                <StudyProgressList records={records} />
              )}
            </div>

            <div data-testid="study-progress-pagination">
              <ResultsPagination
                page={query.pageNo}
                pageCount={pageCount}
                total={total}
                pending={isLoading}
                itemLabel="门课程"
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </SurfaceCard>
      </MotionItem>
    </MotionStagger>
  );
}
