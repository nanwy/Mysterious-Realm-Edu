"use client";

import {
  selectPurchaseCourseList,
  selectPurchaseExamList,
  unwrapEnvelope,
} from "@workspace/api";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  EmptyState,
  Skeleton,
  SurfaceCard,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui";
import {
  AlertCircle,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  ImageOff,
  RefreshCcw,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ResultsPagination } from "@/components/common/results-pagination";
import { resolveMediaUrl, toText } from "@/lib/media";

type PurchaseTab = "course" | "exam";

interface PurchasesQuery {
  tab: PurchaseTab;
  pageNo: number;
  pageSize: number;
}

interface PurchaseListPayload {
  records?: unknown[];
  total?: number;
}

interface PurchaseAction {
  href: string | null;
  label: string;
  hint: string;
}

interface PurchaseRecord {
  id: string;
  title: string;
  coverUrl: string | null;
  primaryMeta: string;
  secondaryMeta: string;
  tertiaryMeta: string;
  progressText: string;
  statusLabel: string;
  statusTone: "default" | "success" | "warning";
  priceText: string;
  action: PurchaseAction;
}

const DEFAULT_QUERY: PurchasesQuery = {
  tab: "course",
  pageNo: 1,
  pageSize: 10,
};

const TAB_META: Array<{
  value: PurchaseTab;
  label: string;
  description: string;
}> = [
  {
    value: "course",
    label: "课程",
    description: "继续学习已购买课程，查看人数、学习进度与状态说明。",
  },
  {
    value: "exam",
    label: "考试",
    description: "查看已购买考试的时长、及格分、人数与后续入口。",
  },
];

const MOCK_PURCHASE_RECORDS: Record<PurchaseTab, PurchaseRecord[]> = {
  course: [
    {
      id: "mock-course-1",
      title: "示例课程：学员端迁移演示课",
      coverUrl: null,
      primaryMeta: "128 人学习",
      secondaryMeta: "普通课程",
      tertiaryMeta: "最近更新：待补课程更新时间",
      progressText: "已学 42%",
      statusLabel: "示例数据",
      statusTone: "warning",
      priceText: "已购课程",
      action: {
        href: null,
        label: "继续学习",
        hint: "当前为接口失败后的示例结构，正式学习入口需等待接口恢复。",
      },
    },
  ],
  exam: [
    {
      id: "mock-exam-1",
      title: "示例考试：章节综合练习",
      coverUrl: null,
      primaryMeta: "时长 90 分钟",
      secondaryMeta: "及格分 60 分",
      tertiaryMeta: "23 人参加",
      progressText: "成绩状态待补充",
      statusLabel: "示例数据",
      statusTone: "warning",
      priceText: "已购考试",
      action: {
        href: null,
        label: "查看考试",
        hint: "当前为接口失败后的示例结构，正式考试入口需等待接口恢复。",
      },
    },
  ],
};

function toRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function toNumberValue(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function toOptionalText(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function formatPrice(value: unknown, isFree: unknown, freeLabel: string) {
  if (toNumberValue(isFree, 0) === 1) {
    return freeLabel;
  }

  if (value === null || value === undefined || value === "") {
    return "价格待补充";
  }

  return `￥${toNumberValue(value).toFixed(2)}`;
}

function formatCourseProgress(value: unknown) {
  const progress = toNumberValue(value, -1);

  if (progress < 0) {
    return "学习进度待补充";
  }

  if (progress >= 1) {
    return "已学完";
  }

  return `已学 ${Math.round(progress * 100)}%`;
}

function resolveCourseStatus(record: Record<string, unknown>) {
  const statusText = toText(record.state_dictText ?? record.stateText, "");

  if (statusText) {
    return {
      label: statusText,
      tone: toNumberValue(record.state, 0) === 0 ? "success" : "warning",
    } as const;
  }

  return {
    label: "已购课程",
    tone: "default",
  } as const;
}

function resolveExamStatus(record: Record<string, unknown>) {
  const passed = toNumberValue(record.passed, -1);

  if (passed === 1) {
    return { label: "已通过", tone: "success" } as const;
  }

  if (passed === 0) {
    return { label: "未通过", tone: "warning" } as const;
  }

  const state = toNumberValue(record.state, -1);
  if (state === 0) {
    return { label: "进行中", tone: "success" } as const;
  }
  if (state === 2) {
    return { label: "未开始", tone: "default" } as const;
  }
  if (state === 3) {
    return { label: "已结束", tone: "warning" } as const;
  }

  return { label: "已购考试", tone: "default" } as const;
}

function normalizeCourseRecord(item: unknown, index: number): PurchaseRecord {
  const record = toRecord(item);
  const status = resolveCourseStatus(record);
  const identifier = record.id ?? record.courseId ?? record.goodsId ?? `purchase-course-${index + 1}`;
  const courseId = toOptionalText(record.id ?? record.courseId ?? record.goodsId);

  return {
    id: String(identifier),
    title: toText(record.name ?? record.courseName ?? record.goodsName, `课程 ${index + 1}`),
    coverUrl: resolveMediaUrl(toOptionalText(record.cover ?? record.image ?? record.poster)),
    primaryMeta: `${toNumberValue(record.learnerNumber)} 人学习`,
    secondaryMeta: toNumberValue(record.isLive, 0) === 1 ? "直播课程" : "录播课程",
    tertiaryMeta: toText(
      record.teacherName ?? record.categoryName ?? record.createTime,
      "课程信息待补充"
    ),
    progressText: formatCourseProgress(record.courseStudyProcess),
    statusLabel: status.label,
    statusTone: status.tone,
    priceText: formatPrice(record.price, record.isFree, "免费课程"),
    action: {
      href: courseId ? `/courses/${courseId}` : null,
      label: "继续学习",
      hint: courseId ? "进入课程学习页继续完成章节与任务。" : "课程入口字段缺失，暂时无法直接跳转。",
    },
  };
}

function normalizeExamRecord(item: unknown, index: number): PurchaseRecord {
  const record = toRecord(item);
  const status = resolveExamStatus(record);
  const identifier = record.id ?? record.examId ?? record.goodsId ?? `purchase-exam-${index + 1}`;
  const examId = toOptionalText(record.id ?? record.examId ?? record.goodsId);

  return {
    id: String(identifier),
    title: toText(record.title ?? record.examTitle ?? record.goodsName, `考试 ${index + 1}`),
    coverUrl: resolveMediaUrl(toOptionalText(record.image ?? record.cover ?? record.poster)),
    primaryMeta: `时长 ${toNumberValue(record.totalTime)} 分钟`,
    secondaryMeta: `及格分 ${toNumberValue(record.qualifyScore)} 分`,
    tertiaryMeta: `${toNumberValue(record.examNumber)} 人参加`,
    progressText:
      toNumberValue(record.passed, -1) === 1
        ? "考试结果：已通过"
        : toNumberValue(record.passed, -1) === 0
          ? "考试结果：未通过"
          : "考试结果待补充",
    statusLabel: status.label,
    statusTone: status.tone,
    priceText: formatPrice(record.price, record.isFree, "免费考试"),
    action: {
      href: examId ? `/exams/${examId}/preview` : null,
      label: "查看考试",
      hint: examId ? "进入考试预览页查看说明与后续入口。" : "考试入口字段缺失，暂时无法直接跳转。",
    },
  };
}

async function fetchPurchases(query: PurchasesQuery) {
  const response =
    query.tab === "course"
      ? await selectPurchaseCourseList({
          pageNo: query.pageNo,
          pageSize: query.pageSize,
          name: "",
          examTitle: "",
        })
      : await selectPurchaseExamList({
          pageNo: query.pageNo,
          pageSize: query.pageSize,
          name: "",
          examTitle: "",
        });
  const payload = unwrapEnvelope(response);
  const result = toRecord(payload) as PurchaseListPayload;
  const recordsSource = Array.isArray(result.records) ? result.records : [];
  const records =
    query.tab === "course"
      ? recordsSource.map(normalizeCourseRecord)
      : recordsSource.map(normalizeExamRecord);

  return {
    records,
    total: toNumberValue(result.total, records.length),
  };
}

function getErrorMessage(error: unknown) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "已购商品接口暂时不可用，请稍后重试。";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，当前仅展示错误说明与示例结构。`;
  }

  if (message === "网络请求失败") {
    return "已购商品接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
}

function PurchasesLoadingState() {
  return (
    <div className="grid gap-3" data-testid="purchases-loading">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-[24px] border border-border bg-card/90 p-5">
          <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
            <Skeleton className="h-32 w-full rounded-[20px]" />
            <div className="grid gap-3">
              <Skeleton className="h-5 w-40 rounded-full" />
              <Skeleton className="h-4 w-56 rounded-full" />
              <Skeleton className="h-4 w-48 rounded-full" />
              <Skeleton className="h-10 w-32 rounded-[16px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PurchaseStatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: PurchaseRecord["statusTone"];
}) {
  if (tone === "success") {
    return <Badge> {label} </Badge>;
  }

  if (tone === "warning") {
    return <Badge variant="outline">{label}</Badge>;
  }

  return <Badge variant="secondary">{label}</Badge>;
}

function PurchaseCard({ record, tab }: { record: PurchaseRecord; tab: PurchaseTab }) {
  return (
    <MotionItem>
      <article className="overflow-hidden rounded-[24px] border border-border bg-card/90 shadow-sm">
        <div className="grid gap-5 p-5 md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-[20px] border border-border bg-muted/30">
            {record.coverUrl ? (
              <img
                src={record.coverUrl}
                alt={record.title}
                className="h-full min-h-36 w-full object-cover"
              />
            ) : (
              <div className="flex min-h-36 items-center justify-center gap-2 text-sm text-muted-foreground">
                <ImageOff className="size-4" />
                暂无封面
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <PurchaseStatusBadge label={record.statusLabel} tone={record.statusTone} />
                  <span className="text-sm text-muted-foreground">
                    {tab === "course" ? "课程内容" : "考试内容"}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-foreground">{record.title}</h3>
              </div>
              <p className="text-sm font-medium text-foreground">{record.priceText}</p>
            </div>

            <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
              <div className="flex items-center gap-2">
                {tab === "course" ? (
                  <BookOpen className="size-4" />
                ) : (
                  <Timer className="size-4" />
                )}
                <span>{record.primaryMeta}</span>
              </div>
              <div className="flex items-center gap-2">
                {tab === "course" ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <ClipboardList className="size-4" />
                )}
                <span>{record.secondaryMeta}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarClock className="size-4" />
                <span>{record.tertiaryMeta}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4" />
                <span>{record.progressText}</span>
              </div>
            </div>

            <div
              className="flex flex-col gap-3 rounded-[20px] border border-border/70 bg-muted/20 px-4 py-3 md:flex-row md:items-center md:justify-between"
              data-testid="purchase-action-entry"
            >
              <p className="text-sm text-muted-foreground">{record.action.hint}</p>
              {record.action.href ? (
                <Link
                  href={record.action.href}
                  className="inline-flex items-center gap-2 rounded-[16px] border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {record.action.label}
                  <ChevronRight className="size-4" />
                </Link>
              ) : (
                <span className="text-sm font-medium text-foreground">{record.action.label}待开放</span>
              )}
            </div>
          </div>
        </div>
      </article>
    </MotionItem>
  );
}

function PurchasesList({
  records,
  tab,
}: {
  records: PurchaseRecord[];
  tab: PurchaseTab;
}) {
  return (
    <MotionStagger className="grid gap-4" delayChildren={0.06} data-testid="purchases-list">
      {records.map((record) => (
        <PurchaseCard key={record.id} record={record} tab={tab} />
      ))}
    </MotionStagger>
  );
}

export function PurchasesPageShell() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [records, setRecords] = useState<PurchaseRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showMockData, setShowMockData] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);

    void fetchPurchases(query)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setRecords(result.records);
        setTotal(result.total);
        setError(null);
        setHasLoaded(true);
        setIsLoading(false);
        setShowMockData(false);
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
        setShowMockData(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  const currentTab = TAB_META.find((item) => item.value === query.tab) ?? TAB_META[0];
  const visibleRecords = showMockData ? MOCK_PURCHASE_RECORDS[query.tab] : records;
  const visibleTotal = showMockData ? MOCK_PURCHASE_RECORDS[query.tab].length : total;
  const pageCount = Math.max(1, Math.ceil(visibleTotal / query.pageSize));

  function handleTabChange(value: string) {
    const nextTab: PurchaseTab = value === "exam" ? "exam" : "course";

    setQuery((current) => ({
      ...current,
      tab: nextTab,
      pageNo: 1,
    }));
  }

  function handleRetry() {
    setQuery((current) => ({ ...current }));
  }

  function handlePageChange(page: number) {
    const safePage = Math.min(Math.max(page, 1), pageCount);

    setQuery((current) => ({
      ...current,
      pageNo: safePage,
    }));
  }

  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Purchases"
          title="已购商品"
          description="迁移旧版课程 / 考试双标签结构，当前直接消费现有 order 模块接口；若环境异常，页面会保留错误说明和示例结构入口。"
        >
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              <MotionReveal direction="up" delay={0.02}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <p className="text-sm text-muted-foreground">当前分类</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">{currentTab.label}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{currentTab.description}</p>
                </div>
              </MotionReveal>
              <MotionReveal direction="up" delay={0.08}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <p className="text-sm text-muted-foreground">列表状态</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {error ? "请求失败" : hasLoaded ? `${records.length} 条` : "加载中"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {error ?? "列表展示核心字段，并给出继续学习 / 查看考试或占位说明。"}
                  </p>
                </div>
              </MotionReveal>
              <MotionReveal direction="up" delay={0.14}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <p className="text-sm text-muted-foreground">分页信息</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    第 {query.pageNo} / {pageCount} 页
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    共 {visibleTotal} 条已购内容，单页 {query.pageSize} 条。
                  </p>
                </div>
              </MotionReveal>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <Badge variant="outline">课程 / 考试双分类</Badge>
              <Badge variant="outline">分页 {query.pageSize} 条/页</Badge>
              <Badge variant="outline">
                {process.env.NEXT_PUBLIC_API_BASE_URL ? "接口环境已配置" : "接口环境待配置"}
              </Badge>
            </div>

            <div data-testid="purchases-tabs">
              <Tabs value={query.tab} onValueChange={handleTabChange}>
                <TabsList aria-label="已购内容分类">
                  {TAB_META.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {TAB_META.map((tab) => (
                  <TabsContent key={tab.value} value={tab.value}>
                    <div className="sr-only">{tab.label}已购内容列表</div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </SurfaceCard>
      </MotionItem>

      <MotionItem>
        <SurfaceCard
          title={`${currentTab.label}已购列表`}
          description="保留 loading / empty / error 三种兜底状态；接口失败时不会崩溃，并可查看最小示例结构确认页面布局。"
        >
          <div className="grid gap-6">
            <div data-testid="purchases-list-region">
              {!hasLoaded || isLoading ? (
                <PurchasesLoadingState />
              ) : error ? (
                <div className="grid gap-4">
                  <Alert>
                    <AlertCircle className="size-4" />
                    <AlertTitle>已购商品接口暂不可用</AlertTitle>
                    <AlertDescription>
                      当前无法加载{currentTab.label}已购内容：{error}
                    </AlertDescription>
                  </Alert>
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" onClick={handleRetry}>
                      <RefreshCcw className="size-4" />
                      重试加载
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowMockData(true);
                      }}
                    >
                      查看示例结构
                    </Button>
                  </div>
                  {showMockData ? (
                    <div className="grid gap-4">
                      <Alert>
                        <AlertCircle className="size-4" />
                        <AlertTitle>当前展示示例结构</AlertTitle>
                        <AlertDescription>
                          这些条目用于兜底验证切换区、列表区和动作入口结构，不代表真实购买记录。
                        </AlertDescription>
                      </Alert>
                      <PurchasesList records={visibleRecords} tab={query.tab} />
                    </div>
                  ) : null}
                </div>
              ) : visibleRecords.length === 0 ? (
                <EmptyState
                  title={`暂无${currentTab.label}已购内容`}
                  description={`当前分类下还没有可展示的${currentTab.label}已购记录。`}
                />
              ) : (
                <PurchasesList records={visibleRecords} tab={query.tab} />
              )}
            </div>

            <div data-testid="purchases-pagination">
              <ResultsPagination
                page={query.pageNo}
                pageCount={pageCount}
                total={visibleTotal}
                pending={isLoading}
                itemLabel="项已购内容"
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </SurfaceCard>
      </MotionItem>
    </MotionStagger>
  );
}
