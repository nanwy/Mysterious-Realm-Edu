"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState, type FormEvent } from "react";
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
  BookOpen,
  CalendarClock,
  Clock3,
  GraduationCap,
  Package2,
  RefreshCcw,
  Search,
} from "lucide-react";
import { ResultsPagination } from "@/components/common/results-pagination";
import { toNumberOrFallback, toRecordOrEmpty, toText } from "@/lib/normalize";

type PurchaseTab = "course" | "exam";

interface PurchaseQuery {
  pageNo: number;
  pageSize: number;
  keyword: string;
  tab: PurchaseTab;
}

interface PurchaseRecord {
  id: string;
  tab: PurchaseTab;
  title: string;
  purchaseTime: string;
  validityLabel: string;
  statusLabel: string;
  progressLabel: string;
  amountLabel: string;
  supportingMeta: string;
  actionLabel: string;
  href: string | null;
  unavailableHint: string | null;
}

interface PurchaseListPayload {
  records?: unknown[];
  total?: number;
}

const PAGE_SIZE = 10;

const TAB_META: Record<
  PurchaseTab,
  {
    label: string;
    eyebrow: string;
    summary: string;
    detail: string;
    emptyTitle: string;
    emptyDescription: string;
  }
> = {
  course: {
    label: "已购课程",
    eyebrow: "Purchased Courses",
    summary: "课程类已购内容会集中展示购买时间、有效期和继续学习入口。",
    detail: "适合快速找回已经买过但还没完成的课程，直接回到学习主线。",
    emptyTitle: "还没有已购课程",
    emptyDescription: "课程订单回传后会出现在这里，你可以通过关键词继续筛选已购课程。",
  },
  exam: {
    label: "已购考试",
    eyebrow: "Purchased Exams",
    summary: "考试类已购内容会展示购买记录、有效信息和可进入的考试预览入口。",
    detail: "当考试尚未迁移到可直接作答时，这里会只保留明确可达的预览或说明。",
    emptyTitle: "还没有已购考试",
    emptyDescription: "考试订单同步后会出现在这里，便于重新确认考试信息和后续安排。",
  },
};

function getErrorMessage(error: unknown) {
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return "未检测到 NEXT_PUBLIC_API_BASE_URL，当前无法请求已购接口，请补充环境变量后重试。";
  }

  if (error instanceof Error && error.message === "网络请求失败") {
    return "已购接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "已购接口暂时不可用，请稍后重试。";
}

function resolvePurchaseTime(record: Record<string, unknown>) {
  return (
    toText(record.payTime) ||
    toText(record.paymentTime) ||
    toText(record.buyTime) ||
    toText(record.purchaseTime) ||
    toText(record.createTime) ||
    "待同步购买时间"
  );
}

function resolveValidityLabel(record: Record<string, unknown>) {
  const endTime =
    toText(record.validityEndTime) ||
    toText(record.expireTime) ||
    toText(record.endTime) ||
    toText(record.invalidTime);

  if (endTime) {
    return `有效至 ${endTime}`;
  }

  const days =
    toText(record.validDays) ||
    toText(record.expireDays) ||
    toText(record.validityDay);

  if (days) {
    return `有效期 ${days} 天`;
  }

  return "有效期待同步";
}

function normalizeCourseRecord(item: unknown, index: number): PurchaseRecord {
  const record = toRecordOrEmpty(item);
  const routeId = toText(record.id ?? record.courseId ?? record.goodsId);
  const title =
    toText(record.name) ||
    toText(record.courseName) ||
    toText(record.goodsName) ||
    `课程 ${index + 1}`;
  const studyProcess = toText(record.courseStudyProcess ?? record.studyProcess);
  const learnerCount = toText(record.learnerNumber ?? record.studyCount ?? record.learnCount);

  return {
    id: routeId || `course-${index + 1}`,
    tab: "course",
    title,
    purchaseTime: resolvePurchaseTime(record),
    validityLabel: resolveValidityLabel(record),
    statusLabel:
      toText(record.state_dictText) ||
      toText(record.studyStatusName) ||
      (studyProcess ? "学习中" : "待开始"),
    progressLabel: studyProcess ? `学习进度 ${studyProcess}` : "学习进度待同步",
    amountLabel:
      record.isFree === true || record.isFree === 1 || record.isFree === "1"
        ? "免费获取"
        : toText(record.price) || "金额待同步",
    supportingMeta: learnerCount ? `${learnerCount} 人学习` : "人数待同步",
    actionLabel: "进入课程",
    href: routeId ? `/courses/${routeId}` : null,
    unavailableHint: routeId ? null : "课程主链路缺少课程 ID，暂时无法生成继续学习入口。",
  };
}

function normalizeExamRecord(item: unknown, index: number): PurchaseRecord {
  const record = toRecordOrEmpty(item);
  const routeId = toText(record.id ?? record.examId ?? record.goodsId);
  const totalTime = toText(record.totalTime ?? record.examDuration);
  const qualifyScore = toText(record.qualifyScore ?? record.passScore);
  const examCount = toText(record.examNumber ?? record.joinCount ?? record.userCount);

  return {
    id: routeId || `exam-${index + 1}`,
    tab: "exam",
    title:
      toText(record.title) ||
      toText(record.examTitle) ||
      toText(record.goodsName) ||
      `考试 ${index + 1}`,
    purchaseTime: resolvePurchaseTime(record),
    validityLabel: resolveValidityLabel(record),
    statusLabel:
      toText(record.state_dictText) ||
      toText(record.examStatusName) ||
      toText(record.statusName) ||
      "考试状态待同步",
    progressLabel: totalTime ? `考试时长 ${totalTime} 分钟` : "考试时长待同步",
    amountLabel:
      record.isFree === true || record.isFree === 1 || record.isFree === "1"
        ? "免费获取"
        : toText(record.price) || "金额待同步",
    supportingMeta: qualifyScore
      ? `及格分 ${qualifyScore}${examCount ? ` · ${examCount} 人参加` : ""}`
      : examCount
        ? `${examCount} 人参加`
        : "考试信息待同步",
    actionLabel: "查看考试",
    href: routeId ? `/exams/${routeId}/preview` : null,
    unavailableHint: routeId ? null : "考试缺少可用 ID，当前只能展示已购记录，不能制造不可达入口。",
  };
}

async function fetchPurchases(query: PurchaseQuery) {
  const payload =
    query.tab === "course"
      ? {
          pageNo: query.pageNo,
          pageSize: query.pageSize,
          name: query.keyword.trim(),
          examTitle: "",
        }
      : {
          pageNo: query.pageNo,
          pageSize: query.pageSize,
          name: "",
          examTitle: query.keyword.trim(),
        };

  const response =
    query.tab === "course"
      ? await selectPurchaseCourseList(payload)
      : await selectPurchaseExamList(payload);
  const result = toRecordOrEmpty(unwrapEnvelope(response)) as PurchaseListPayload;
  const sourceRecords = Array.isArray(result.records) ? result.records : [];

  return {
    records:
      query.tab === "course"
        ? sourceRecords.map(normalizeCourseRecord)
        : sourceRecords.map(normalizeExamRecord),
    total: toNumberOrFallback(result.total, sourceRecords.length),
  };
}

function PurchasesLoadingState() {
  return (
    <div className="grid gap-4" data-testid="purchases-loading">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[28px] border border-border/80 bg-card/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-8 w-2/3 rounded-full" />
          <Skeleton className="mt-4 h-5 w-full rounded-full" />
          <Skeleton className="mt-2 h-5 w-4/5 rounded-full" />
          <Skeleton className="mt-5 h-24 w-full rounded-[24px]" />
        </div>
      ))}
    </div>
  );
}

function PurchaseList({ records }: { records: PurchaseRecord[] }) {
  return (
    <MotionStagger className="grid gap-4" delayChildren={0.06} data-testid="purchases-list">
      {records.map((record) => {
        const Icon = record.tab === "course" ? BookOpen : GraduationCap;

        return (
          <MotionItem key={`${record.tab}-${record.id}`}>
            <article className="overflow-hidden rounded-[28px] border border-border/80 bg-card/92 shadow-[0_22px_50px_rgba(15,23,42,0.06)]">
              <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="p-5 md:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{record.tab === "course" ? "课程" : "考试"}</Badge>
                    <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                      {record.statusLabel}
                    </span>
                    <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                      {record.amountLabel}
                    </span>
                  </div>

                  <h3 className="mt-4 text-[1.55rem] font-black tracking-[-0.04em] text-foreground">
                    {record.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {record.progressLabel} · {record.supportingMeta}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5">
                      <CalendarClock className="size-4" />
                      购买时间 {record.purchaseTime}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5">
                      <Clock3 className="size-4" />
                      {record.validityLabel}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/70 bg-muted/30 p-5 xl:border-t-0 xl:border-l">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Action Layer
                  </p>
                  <div className="mt-4 flex h-full flex-col justify-between gap-4">
                    <div className="rounded-[24px] border border-border/70 bg-background/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:bg-background/60">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-muted/40">
                          <Icon className="size-5 text-foreground" />
                        </span>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">{record.actionLabel}</p>
                          <p className="text-xs leading-6 text-muted-foreground">
                            {record.href
                              ? "当前已对接可达路由，可直接回到后续学习或考试预览。"
                              : record.unavailableHint}
                          </p>
                        </div>
                      </div>
                    </div>

                    {record.href ? (
                      <Button render={<Link href={record.href} />} data-testid="purchase-action-entry">
                        {record.actionLabel}
                        <ArrowRight className="size-4" />
                      </Button>
                    ) : (
                      <Button disabled data-testid="purchase-action-entry">
                        暂无可用入口
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </MotionItem>
        );
      })}
    </MotionStagger>
  );
}

export function PurchasesPageShell() {
  const [tab, setTab] = useState<PurchaseTab>("course");
  const [draftKeyword, setDraftKeyword] = useState("");
  const [query, setQuery] = useState<PurchaseQuery>({
    pageNo: 1,
    pageSize: PAGE_SIZE,
    keyword: "",
    tab: "course",
  });
  const [records, setRecords] = useState<PurchaseRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    void fetchPurchases(query)
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
        setHasLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(query.pageNo, totalPages);
  const meta = TAB_META[tab];
  const actionableCount = records.filter((item) => Boolean(item.href)).length;
  const unavailableCount = records.filter((item) => !item.href).length;
  const overviewItems = useMemo(
    () => [
      {
        label: "当前分区",
        value: meta.label,
      },
      {
        label: "检索关键词",
        value: query.keyword.trim() || "未筛选",
      },
      {
        label: "结果总数",
        value: error ? "接口异常" : isLoading ? "加载中" : `${total} 条`,
      },
    ],
    [error, isLoading, meta.label, query.keyword, total]
  );
  const resultSignals = useMemo(
    () => [
      {
        label: "当前页记录",
        value: isLoading ? "同步中" : `${records.length} 条`,
      },
      {
        label: "可继续入口",
        value: isLoading ? "--" : `${actionableCount} 个`,
      },
      {
        label: "需人工确认",
        value: isLoading ? "--" : `${unavailableCount} 个`,
      },
    ],
    [actionableCount, isLoading, records.length, unavailableCount]
  );

  function updateQuery(next: PurchaseQuery) {
    startTransition(() => {
      setQuery(next);
    });
  }

  function handleTabChange(nextValue: string) {
    const nextTab = nextValue === "exam" ? "exam" : "course";
    setTab(nextTab);
    setDraftKeyword("");
    updateQuery({
      pageNo: 1,
      pageSize: PAGE_SIZE,
      keyword: "",
      tab: nextTab,
    });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateQuery({
      ...query,
      tab,
      pageNo: 1,
      keyword: draftKeyword,
    });
  }

  function handleReset() {
    setDraftKeyword("");
    updateQuery({
      ...query,
      tab,
      pageNo: 1,
      keyword: "",
    });
  }

  function handleReload() {
    updateQuery({
      ...query,
      tab,
    });
  }

  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Purchase Ledger"
          title="已购内容"
          description="迁移旧版学员端已购商品页，把课程与考试订单收拢到同一工作台里，保留类型切换、搜索、分页、购买时间和继续入口。"
        >
          <div className="grid gap-8 xl:grid-cols-[minmax(19rem,0.9fr)_minmax(0,1.5fr)] xl:items-start">
            <div className="grid gap-5 xl:sticky xl:top-6">
              <MotionReveal direction="up">
                <section className="grid gap-6 rounded-[32px] border border-border bg-muted/30 p-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge>真实接口</Badge>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        {meta.eyebrow}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold text-foreground">先确认类型，再继续处理已购内容</h2>
                      <p className="text-sm leading-7 text-muted-foreground">{meta.summary}</p>
                      <p className="text-sm leading-7 text-muted-foreground">{meta.detail}</p>
                    </div>
                  </div>

                  <MotionStagger className="grid gap-3" delayChildren={0.06}>
                    {overviewItems.map((item) => (
                      <MotionItem key={item.label}>
                        <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-3 last:border-b-0 last:pb-0">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {item.label}
                          </p>
                          <p className="text-right text-sm font-semibold text-foreground">{item.value}</p>
                        </div>
                      </MotionItem>
                    ))}
                  </MotionStagger>
                </section>
              </MotionReveal>
            </div>

            <div className="grid gap-5">
              <section
                data-testid="purchases-tabs"
                className="rounded-[32px] border border-border bg-card/92 p-5 shadow-sm"
              >
                <Tabs value={tab} onValueChange={handleTabChange}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">内容分区</p>
                      <p className="text-sm leading-7 text-muted-foreground">
                        课程与考试分开承接，避免把不同节奏的已购内容平铺成同一列表。
                      </p>
                    </div>
                    <TabsList aria-label="已购内容类型">
                      <TabsTrigger value="course">已购课程</TabsTrigger>
                      <TabsTrigger value="exam">已购考试</TabsTrigger>
                    </TabsList>
                  </div>
                </Tabs>

                <form
                  onSubmit={handleSearchSubmit}
                  className="mt-5 grid gap-3 rounded-[28px] border border-border/70 bg-background/80 p-4 md:grid-cols-[minmax(0,1fr)_auto_auto]"
                >
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {tab === "course" ? "搜索已购课程" : "搜索已购考试"}
                    </span>
                    <Input
                      value={draftKeyword}
                      onChange={(event) => setDraftKeyword(event.target.value)}
                      placeholder={tab === "course" ? "输入课程名称或关键词" : "输入考试名称或关键词"}
                    />
                  </label>
                  <div className="mt-auto">
                    <Button type="submit" disabled={isLoading}>
                      <Search className="size-4" />
                      搜索
                    </Button>
                  </div>
                  <div className="mt-auto">
                    <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading}>
                      <RefreshCcw className="size-4" />
                      重置
                    </Button>
                  </div>
                </form>
              </section>

              {error ? (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>已购内容暂时不可用</AlertTitle>
                  <AlertDescription className="space-y-3">
                    <p>{error}</p>
                    <div>
                      <Button type="button" variant="outline" onClick={handleReload}>
                        <RefreshCcw className="size-4" />
                        重新请求
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : null}

              <MotionReveal direction="up">
                <section className="grid gap-3 rounded-[28px] border border-border/80 bg-muted/20 p-4 md:grid-cols-3">
                  {resultSignals.map((item) => (
                    <div key={item.label} className="rounded-[22px] border border-border/70 bg-background/80 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-3 text-[1.6rem] font-black tracking-[-0.05em] text-foreground">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </section>
              </MotionReveal>

              <div className="grid gap-4" data-testid="purchases-list-region">
                {isLoading ? <PurchasesLoadingState /> : null}

                {!isLoading && !error && records.length > 0 ? <PurchaseList records={records} /> : null}

                {!isLoading && !error && hasLoaded && records.length === 0 ? (
                  <EmptyState
                    icon={Package2}
                    title={meta.emptyTitle}
                    description={meta.emptyDescription}
                    actions={
                      <Button type="button" variant="outline" onClick={handleReset}>
                        清空筛选
                      </Button>
                    }
                  />
                ) : null}
              </div>

              {!error && !isLoading && totalPages > 1 ? (
                <div data-testid="purchases-pagination">
                  <ResultsPagination
                    page={currentPage}
                    pageCount={totalPages}
                    total={total}
                    pending={isLoading}
                    itemLabel={tab === "course" ? "门课程" : "场考试"}
                    onPageChange={(page) =>
                      updateQuery({
                        ...query,
                        tab,
                        pageNo: page,
                      })
                    }
                  />
                </div>
              ) : null}
            </div>
          </div>
        </SurfaceCard>
      </MotionItem>
    </MotionStagger>
  );
}
