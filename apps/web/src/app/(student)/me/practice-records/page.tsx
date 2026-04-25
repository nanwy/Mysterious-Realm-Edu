"use client";

import { useForm } from "@tanstack/react-form";
import { api, unwrapEnvelope } from "@workspace/api";
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
  StudentShell,
  SurfaceCard,
} from "@workspace/ui";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ListFilter,
  RefreshCcw,
  Search,
  Target,
} from "lucide-react";
import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import { ResultsPagination } from "@/components/common/results-pagination";
import { toNumberOrFallback, toRecordOrEmpty, toText } from "@/lib/normalize";

interface PracticeRecordsQuery {
  repositoryName: string;
  practiceName: string;
  pageNo: number;
  pageSize: number;
}

interface PracticeRecordItem {
  id: string;
  repositoryName: string;
  practiceName: string;
  rightNumber: number;
  totalNumber: number;
  accuracy: number;
  accuracyLabel: string;
  commitTime: string;
  durationLabel: string;
  statusLabel: string;
  resultHref: string;
}

interface PracticeRecordsPayload {
  records: unknown[];
  total: number;
}

interface PracticeRecordsResult {
  records: PracticeRecordItem[];
  total: number;
}

const DEFAULT_QUERY: PracticeRecordsQuery = {
  repositoryName: "",
  practiceName: "",
  pageNo: 1,
  pageSize: 10,
};

const getErrorMessage = (error: unknown) => {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "练习记录数据暂时不可用，请稍后重试。";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。当前未连接练习记录服务，已切换到示例内容。`;
  }

  if (message === "网络请求失败") {
    return "练习记录数据暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
};

const normalizeAccuracy = (value: unknown, rightNumber: number, totalNumber: number) => {
  const raw = toNumberOrFallback(value, Number.NaN);
  const derived = totalNumber > 0 ? (rightNumber / totalNumber) * 100 : 0;
  const numeric = Number.isFinite(raw) ? raw : derived;

  if (numeric <= 1 && numeric > 0) {
    return Math.round(numeric * 100);
  }

  return Math.min(100, Math.max(0, Math.round(numeric)));
};

const formatDuration = (seconds: number) => {
  if (seconds <= 0) {
    return "用时待同步";
  }

  if (seconds < 60) {
    return `${seconds} 秒`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} 分钟`;
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  return restMinutes > 0 ? `${hours} 小时 ${restMinutes} 分钟` : `${hours} 小时`;
};

const toPracticeRecordsPayload = (value: unknown): PracticeRecordsPayload => {
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
    total: toNumberOrFallback(payload.total ?? payload.count ?? payload.totalCount, records.length),
  };
};

const normalizePracticeRecord = (item: unknown, index: number): PracticeRecordItem => {
  const record = toRecordOrEmpty(item);
  const id = toText(record.id ?? record.userPracticeId, `practice-record-${index + 1}`);
  const rightNumber = toNumberOrFallback(record.rightNumber ?? record.correctNumber ?? record.rightCount, 0);
  const totalNumber = toNumberOrFallback(record.totalNumber ?? record.questionNumber ?? record.totalCount, 0);
  const accuracy = normalizeAccuracy(record.accuracy ?? record.correctRate, rightNumber, totalNumber);
  const durationSeconds = toNumberOrFallback(
    record.userTime ?? record.useTime ?? record.duration ?? record.practiceTime,
    0
  );
  const statusLabel =
    toText(record.statusName) ||
    toText(record.state_dictText) ||
    toText(record.practiceStatusName) ||
    (totalNumber > 0 ? "已提交" : "记录待补全");

  return {
    id,
    repositoryName:
      toText(record.repositoryName) ||
      toText(record.repositoryTitle) ||
      toText(record.questionBankName) ||
      `题库 ${index + 1}`,
    practiceName:
      toText(record.practiceName) ||
      toText(record.modeName) ||
      toText(record.practiceModeName) ||
      "自由练习",
    rightNumber,
    totalNumber,
    accuracy,
    accuracyLabel: `${accuracy}%`,
    commitTime:
      toText(record.commitTime) ||
      toText(record.submitTime) ||
      toText(record.updateTime) ||
      "提交时间待同步",
    durationLabel: formatDuration(durationSeconds),
    statusLabel,
    resultHref: `/practice/userPracticeResult/${id}`,
  };
};

const hasActiveFilters = (query: Pick<PracticeRecordsQuery, "repositoryName" | "practiceName">) =>
  Boolean(query.repositoryName.trim() || query.practiceName.trim());

const filterPracticeRecords = (
  records: PracticeRecordItem[],
  query: Pick<PracticeRecordsQuery, "repositoryName" | "practiceName">
) => {
  const repositoryName = query.repositoryName.trim();
  const practiceName = query.practiceName.trim();

  return records.filter((record) => {
    const matchesRepository = repositoryName ? record.repositoryName.includes(repositoryName) : true;
    const matchesPractice = practiceName ? record.practiceName.includes(practiceName) : true;

    return matchesRepository && matchesPractice;
  });
};

const paginatePracticeRecords = (
  records: PracticeRecordItem[],
  pageNo: number,
  pageSize: number
): PracticeRecordsResult => {
  const safePageSize = Math.max(pageSize, 1);
  const total = records.length;
  const pageCount = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(pageNo, 1), pageCount);
  const startIndex = (safePage - 1) * safePageSize;

  return {
    records: records.slice(startIndex, startIndex + safePageSize),
    total,
  };
};

const createMockPracticeRecords = (query: PracticeRecordsQuery) => {
  const records: PracticeRecordItem[] = [
    {
      id: "mock-practice-record-1",
      repositoryName: "综合能力高频题库",
      practiceName: "自由练习",
      rightNumber: 42,
      totalNumber: 50,
      accuracy: 84,
      accuracyLabel: "84%",
      commitTime: "2026-04-24 20:16",
      durationLabel: "38 分钟",
      statusLabel: "示例数据",
      resultHref: "/practice/userPracticeResult/mock-practice-record-1",
    },
    {
      id: "mock-practice-record-2",
      repositoryName: "行政法专项训练",
      practiceName: "单选题强化",
      rightNumber: 31,
      totalNumber: 40,
      accuracy: 78,
      accuracyLabel: "78%",
      commitTime: "2026-04-22 19:42",
      durationLabel: "27 分钟",
      statusLabel: "示例数据",
      resultHref: "/practice/userPracticeResult/mock-practice-record-2",
    },
    {
      id: "mock-practice-record-3",
      repositoryName: "申论基础题库",
      practiceName: "材料分析练习",
      rightNumber: 18,
      totalNumber: 20,
      accuracy: 90,
      accuracyLabel: "90%",
      commitTime: "2026-04-20 08:30",
      durationLabel: "46 分钟",
      statusLabel: "示例数据",
      resultHref: "/practice/userPracticeResult/mock-practice-record-3",
    },
  ];

  return filterPracticeRecords(records, query);
};

const requestPracticeRecordsPage = async (query: PracticeRecordsQuery): Promise<PracticeRecordsResult> => {
  const response = await api.practice.listUserPractices({
    pageNo: query.pageNo,
    pageSize: query.pageSize,
    repositoryName: query.repositoryName.trim(),
    practiceName: query.practiceName.trim(),
  });
  const result = toPracticeRecordsPayload(unwrapEnvelope(response));

  return {
    records: result.records.map(normalizePracticeRecord),
    total: result.total,
  };
};

const fetchHydratedPracticeRecords = async (query: PracticeRecordsQuery) => {
  const collectorPageSize = Math.max(query.pageSize, 20);
  const firstPage = await requestPracticeRecordsPage({
    ...query,
    pageNo: 1,
    pageSize: collectorPageSize,
  });
  const pageCount = Math.max(1, Math.ceil(firstPage.total / collectorPageSize));
  const pageRequests = [];

  for (let page = 2; page <= pageCount; page += 1) {
    pageRequests.push(
      requestPracticeRecordsPage({
        ...query,
        pageNo: page,
        pageSize: collectorPageSize,
      })
    );
  }

  const remainingPages = await Promise.all(pageRequests);
  const records = [firstPage, ...remainingPages].flatMap((page) => page.records);

  return paginatePracticeRecords(filterPracticeRecords(records, query), query.pageNo, query.pageSize);
};

const fetchPracticeRecords = async (query: PracticeRecordsQuery) => {
  if (!hasActiveFilters(query)) {
    return requestPracticeRecordsPage(query);
  }

  return fetchHydratedPracticeRecords(query);
};

const PracticeRecordsLoadingState = () => (
  <div className="grid gap-4" data-testid="practice-records-loading">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="rounded-[28px] border border-border/80 bg-card/90 p-5 shadow-[0_18px_48px_color-mix(in_oklab,var(--foreground)_6%,transparent)]"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton style={{ height: 20, width: 128, borderRadius: 999 }} />
          <Skeleton style={{ height: 20, width: 88, borderRadius: 999 }} />
        </div>
        <div className="mt-4">
          <Skeleton style={{ height: 32, width: "66.666667%", borderRadius: 999 }} />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Skeleton style={{ height: 84, borderRadius: 24 }} />
          <Skeleton style={{ height: 84, borderRadius: 24 }} />
          <Skeleton style={{ height: 84, borderRadius: 24 }} />
          <Skeleton style={{ height: 84, borderRadius: 24 }} />
        </div>
      </div>
    ))}
  </div>
);

const PracticeRecordsSearchForm = ({
  defaultValues,
  pending,
  onSubmit,
  onReset,
}: {
  defaultValues: Pick<PracticeRecordsQuery, "repositoryName" | "practiceName">;
  pending: boolean;
  onSubmit: (value: Pick<PracticeRecordsQuery, "repositoryName" | "practiceName">) => void;
  onReset: () => void;
}) => {
  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => {
      onSubmit({
        repositoryName: value.repositoryName.trim(),
        practiceName: value.practiceName.trim(),
      });
    },
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <section data-testid="practice-records-filter-section">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] xl:items-end">
          <form.Field name="repositoryName">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="practice-records-repository-name">题库名称</FieldLabel>
                <Input
                  id="practice-records-repository-name"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="输入题库名称，定位训练记录"
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="practiceName">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="practice-records-practice-name">练习模式</FieldLabel>
                <Input
                  id="practice-records-practice-name"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="输入练习模式，筛出专项训练"
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
                form.reset({ repositoryName: "", practiceName: "" });
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
};

const PracticeRecordsOverview = ({
  records,
  total,
  query,
  isLoading,
  error,
  isFallback,
}: {
  records: PracticeRecordItem[];
  total: number;
  query: PracticeRecordsQuery;
  isLoading: boolean;
  error: string | null;
  isFallback: boolean;
}) => {
  const averageAccuracy =
    records.length > 0
      ? Math.round(records.reduce((sum, record) => sum + record.accuracy, 0) / records.length)
      : 0;
  const totalAnswered = records.reduce((sum, record) => sum + record.totalNumber, 0);
  const bestRecord = records.reduce<PracticeRecordItem | null>(
    (current, record) => (!current || record.accuracy > current.accuracy ? record : current),
    null
  );

  return (
    <div className="grid gap-4" data-testid="practice-records-overview">
      <div className="rounded-[28px] border border-border/80 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--background)_96%,var(--primary)_4%),color-mix(in_oklab,var(--card)_88%,var(--primary)_12%))] p-5 shadow-[0_28px_80px_color-mix(in_oklab,var(--foreground)_8%,transparent)] md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Practice Records</Badge>
          <span className="text-sm font-medium text-muted-foreground">题库训练、正确率和复盘入口集中呈现</span>
          {isFallback ? <Badge variant="outline">示例数据</Badge> : null}
        </div>
        <h2 className="mt-5 max-w-4xl text-[clamp(2rem,4vw,3.5rem)] font-black leading-[0.95] tracking-[-0.06em] text-foreground">
          把题库训练沉淀成可复盘的记录流，
          <br />
          先看正确率，再进入结果详情。
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
          按题库与练习模式收拢训练记录，把提交时间、正确率、用时和结果入口放在同一条复盘路径里。
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
          <span className="rounded-full border border-border/70 bg-background/80 px-3 py-2">
            当前第 {query.pageNo} 页
          </span>
          <span className="rounded-full border border-border/70 bg-background/80 px-3 py-2">
            共 {total} 条练习记录
          </span>
          <span className="rounded-full border border-border/70 bg-background/80 px-3 py-2">
            {isLoading ? "正在同步练习记录" : error ? "练习记录同步异常" : "练习记录同步正常"}
          </span>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)]">
          <div className="rounded-[24px] border border-border/70 bg-background/82 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Best Signal</p>
            <p className="mt-3 text-xl font-black tracking-[-0.04em] text-foreground">
              {bestRecord ? bestRecord.repositoryName : "等待练习记录"}
            </p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {bestRecord
                ? `${bestRecord.practiceName} · 正确率 ${bestRecord.accuracyLabel}`
                : "完成练习后，这里会优先提示当前页最高正确率记录。"}
            </p>
          </div>

          <div className="rounded-[24px] border border-border/70 bg-background/82 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Recent Commit</p>
            <p className="mt-3 text-lg font-black tracking-[-0.04em] text-foreground">
              {records[0] ? records[0].commitTime : "暂无提交时间"}
            </p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {records[0] ? `${records[0].repositoryName} 的最近提交记录。` : "产生提交记录后，会在这里显示最近一次训练节奏。"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[24px] border border-border/70 bg-card/88 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">平均正确率</p>
          <p className="mt-3 text-[1.8rem] font-black tracking-[-0.05em] text-foreground">{averageAccuracy}%</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">当前页练习记录的平均正确率。</p>
        </div>

        <div className="rounded-[24px] border border-border/70 bg-card/88 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">累计题量</p>
          <p className="mt-3 text-[1.8rem] font-black tracking-[-0.05em] text-foreground">{totalAnswered}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">当前页已提交记录覆盖的题目总量。</p>
        </div>

        <div className="rounded-[24px] border border-border/70 bg-card/88 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">筛选条件</p>
          <p className="mt-3 text-lg font-black tracking-[-0.03em] text-foreground">
            {hasActiveFilters(query) ? "已启用" : "全部记录"}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {hasActiveFilters(query)
              ? `题库「${query.repositoryName || "全部"}」 · 模式「${query.practiceName || "全部"}」`
              : "当前显示练习记录全量结果。"}
          </p>
        </div>
      </div>
    </div>
  );
};

const PracticeRecordsList = ({
  records,
  isFallback,
}: {
  records: PracticeRecordItem[];
  isFallback: boolean;
}) => (
  <MotionStagger className="grid gap-4" delayChildren={0.06} data-testid="practice-records-list">
    {records.map((record) => (
      <MotionItem key={record.id}>
        <article className="overflow-hidden rounded-[28px] border border-border/80 bg-card/92 shadow-[0_22px_56px_color-mix(in_oklab,var(--foreground)_7%,transparent)]">
          <div className="grid gap-0 xl:grid-cols-[minmax(0,1.2fr)_320px]">
            <div className="p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{record.practiceName}</Badge>
                <Badge variant="outline">{record.statusLabel}</Badge>
                {isFallback ? <Badge variant="outline">示例数据</Badge> : null}
              </div>

              <h3 className="mt-4 text-[1.55rem] font-black tracking-[-0.04em] text-foreground">
                {record.repositoryName}
              </h3>

              <div className="mt-5">
                <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <span>Accuracy</span>
                  <span>{record.accuracyLabel}</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full border border-border/70 bg-muted/60">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                    style={{ width: `${record.accuracy}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-[22px] border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CheckCircle2 className="size-4 text-muted-foreground" />
                    答对数量
                  </div>
                  <p className="mt-3 text-lg font-bold tracking-[-0.03em] text-foreground">
                    {record.rightNumber}/{record.totalNumber || "--"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">用于判断本次训练的基础表现。</p>
                </div>

                <div className="rounded-[22px] border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Target className="size-4 text-muted-foreground" />
                    正确率
                  </div>
                  <p className="mt-3 text-lg font-bold tracking-[-0.03em] text-foreground">{record.accuracyLabel}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">缺少直接数值时会按答对 / 总题数推导。</p>
                </div>

                <div className="rounded-[22px] border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Clock3 className="size-4 text-muted-foreground" />
                    提交时间
                  </div>
                  <p className="mt-3 text-lg font-bold tracking-[-0.03em] text-foreground">{record.commitTime}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">用于还原本次训练发生的时间点。</p>
                </div>

                <div className="rounded-[22px] border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ListFilter className="size-4 text-muted-foreground" />
                    练习模式
                  </div>
                  <p className="mt-3 text-lg font-bold tracking-[-0.03em] text-foreground">{record.practiceName}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">用于筛选和结果复盘定位。</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border/70 bg-muted/28 p-5 xl:border-t-0 xl:border-l">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Result Entry
              </p>
              <dl className="mt-4 grid gap-4">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">用时 / 状态</dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">
                    {record.durationLabel} · {record.statusLabel}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">结果入口</dt>
                  <dd className="mt-2">
                    <Button asChild size="sm">
                      <Link href={record.resultHref}>
                        查看结果
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </Button>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">入口说明</dt>
                  <dd className="mt-1 text-sm font-semibold leading-6 text-foreground">
                    结果详情链路正在接入，当前入口会保留本次练习编号。
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>
      </MotionItem>
    ))}
  </MotionStagger>
);

const PracticeRecordsPageContent = () => {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [records, setRecords] = useState<PracticeRecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);

    void fetchPracticeRecords(query)
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

        const fallbackRecords = createMockPracticeRecords(query);

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

  const handleSearch = (value: Pick<PracticeRecordsQuery, "repositoryName" | "practiceName">) => {
    startTransition(() => {
      setQuery((current) => ({
        ...current,
        repositoryName: value.repositoryName,
        practiceName: value.practiceName,
        pageNo: 1,
      }));
    });
  };

  const handleReset = () => {
    startTransition(() => {
      setQuery((current) => ({
        ...current,
        repositoryName: "",
        practiceName: "",
        pageNo: 1,
      }));
    });
  };

  const handleRetry = () => {
    startTransition(() => {
      setQuery((current) => ({ ...current }));
    });
  };

  const handlePageChange = (page: number) => {
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const safePage = Math.min(Math.max(page, 1), pageCount);

    startTransition(() => {
      setQuery((current) => ({
        ...current,
        pageNo: safePage,
      }));
    });
  };

  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const summaryDescription = useMemo(() => {
    if (error) {
      return isFallback
        ? "数据服务暂时不可用，已切换到示例练习记录，保障页面可读和可操作。"
        : "当前无法读取练习记录，页面保留错误说明和重试入口。";
    }

    if (!hasLoaded || isLoading) {
      return "练习记录加载中，列表与统计区会在当前页面内同步刷新。";
    }

    if (records.length === 0) {
      if (hasActiveFilters(query)) {
        return `没有匹配题库「${query.repositoryName || "全部"}」和模式「${query.practiceName || "全部"}」的练习记录。`;
      }

      return "当前账号还没有可展示的练习记录。";
    }

    return "列表按照题库、练习模式、正确率、提交时间和结果入口组织练习记录。";
  }, [error, hasLoaded, isFallback, isLoading, query, records.length]);

  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Practice Records"
          title="练习记录"
          description="按题库、模式、正确率和提交时间整理每一次练习，方便回看训练表现。"
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] xl:items-start">
            <MotionReveal direction="up" delay={0.03}>
              <PracticeRecordsOverview
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
                  <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-foreground">
                    快速筛出需要复盘的训练记录
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    用题库名称和练习模式收窄记录，快速定位需要回看的专项训练。
                  </p>
                </div>

                <PracticeRecordsSearchForm
                  defaultValues={{
                    repositoryName: query.repositoryName,
                    practiceName: query.practiceName,
                  }}
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
          title="练习记录列表"
          description="列表区按训练结果排序呈现，支持翻页、异常重试和结果回看入口。"
        >
          <div className="grid gap-6">
            <div data-testid="practice-records-list-region">
              {!hasLoaded || isLoading ? (
                <PracticeRecordsLoadingState />
              ) : error ? (
                <div className="grid gap-4">
                  <Alert>
                    <AlertCircle className="size-4" />
                    <AlertTitle>练习记录暂时不可用</AlertTitle>
                    <AlertDescription>
                      当前无法完整加载练习记录：{error}。页面已提供示例记录，帮助你继续查看字段结构与分页行为。
                    </AlertDescription>
                  </Alert>
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" onClick={handleRetry}>
                      <RefreshCcw className="size-4" />
                      重试加载
                    </Button>
                  </div>
                  {records.length > 0 ? (
                    <PracticeRecordsList records={records} isFallback={isFallback} />
                  ) : (
                    <EmptyState
                      title="当前筛选条件下没有可展示的示例记录"
                      description="请清空筛选条件后重试，或等待数据服务恢复后查看真实练习记录。"
                    />
                  )}
                </div>
              ) : records.length === 0 ? (
                <EmptyState
                  title={hasActiveFilters(query) ? "没有匹配的练习记录" : "当前还没有练习记录"}
                  description={
                    hasActiveFilters(query)
                      ? "请调整题库名称或练习模式关键词，或重置筛选后查看全部结果。"
                      : "当你完成在线练习后，这里会展示题库、练习模式、正确率和结果入口。"
                  }
                />
              ) : (
                <PracticeRecordsList records={records} isFallback={isFallback} />
              )}
            </div>

            <div data-testid="practice-records-pagination">
              <ResultsPagination
                page={query.pageNo}
                pageCount={pageCount}
                total={total}
                pending={isLoading}
                itemLabel="条练习记录"
                onPageChange={handlePageChange}
              />
            </div>

            <div className="grid gap-3 rounded-[24px] border border-border/70 bg-muted/35 p-4 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 font-semibold text-foreground">
                <Target className="size-4 text-muted-foreground" />
                数据同步说明
              </p>
              <p>
                数据来自练习记录服务。若暂未返回用时、状态或正确率，页面会显示清晰的待同步文案，并按答对数 / 总题数推导正确率。
              </p>
            </div>
          </div>
        </SurfaceCard>
      </MotionItem>
    </MotionStagger>
  );
};

const PracticeRecordsPage = () => (
  <StudentShell>
    <PracticeRecordsPageContent />
  </StudentShell>
);

export default PracticeRecordsPage;
