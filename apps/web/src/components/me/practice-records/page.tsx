"use client";

import { useQuery } from "@tanstack/react-query";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge, SurfaceCard } from "@workspace/ui";
import { Target } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { ResultsPagination } from "@/components/common/results-pagination";
import { PracticeRecordsFilters } from "@/components/me/practice-records/filters";
import {
  PracticeRecordsResults,
  hasPracticeRecordFilters,
} from "@/components/me/practice-records/results";
import {
  createMockPracticeRecords,
  normalizePracticeRecordsError,
  practiceRecordQueryOptions,
} from "@/core/practice-records";
import type {
  PracticeRecordItem,
  PracticeRecordsFilterValues,
  PracticeRecordsQuery,
} from "@/core/practice-records";

const createQueryString = (query: PracticeRecordsQuery) => {
  const params = new URLSearchParams();

  if (query.pageNo > 1) {
    params.set("page", String(query.pageNo));
  }

  if (query.repositoryName.trim()) {
    params.set("repositoryName", query.repositoryName.trim());
  }

  if (query.practiceName.trim()) {
    params.set("practiceName", query.practiceName.trim());
  }

  const result = params.toString();
  return result ? `?${result}` : "";
};

const PracticeRecordsOverview = ({
  records,
  total,
  query,
  loading,
  error,
  isFallback,
}: {
  records: PracticeRecordItem[];
  total: number;
  query: PracticeRecordsQuery;
  loading: boolean;
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
          <span className="text-sm font-medium text-muted-foreground">
            题库训练、正确率和复盘入口集中呈现
          </span>
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
            {loading ? "正在同步练习记录" : error ? "练习记录同步异常" : "练习记录同步正常"}
          </span>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)]">
          <div className="rounded-[24px] border border-border/70 bg-background/82 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Best Signal
            </p>
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
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Recent Commit
            </p>
            <p className="mt-3 text-lg font-black tracking-[-0.04em] text-foreground">
              {records[0] ? records[0].commitTime : "暂无提交时间"}
            </p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {records[0]
                ? `${records[0].repositoryName} 的最近提交记录。`
                : "产生提交记录后，会在这里显示最近一次训练节奏。"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[24px] border border-border/70 bg-card/88 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            平均正确率
          </p>
          <p className="mt-3 text-[1.8rem] font-black tracking-[-0.05em] text-foreground">
            {averageAccuracy}%
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            当前页练习记录的平均正确率。
          </p>
        </div>

        <div className="rounded-[24px] border border-border/70 bg-card/88 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            累计题量
          </p>
          <p className="mt-3 text-[1.8rem] font-black tracking-[-0.05em] text-foreground">
            {totalAnswered}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            当前页已提交记录覆盖的题目总量。
          </p>
        </div>

        <div className="rounded-[24px] border border-border/70 bg-card/88 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            筛选条件
          </p>
          <p className="mt-3 text-lg font-black tracking-[-0.03em] text-foreground">
            {hasPracticeRecordFilters(query) ? "已启用" : "全部记录"}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {hasPracticeRecordFilters(query)
              ? `题库「${query.repositoryName || "全部"}」 · 模式「${query.practiceName || "全部"}」`
              : "当前显示练习记录全量结果。"}
          </p>
        </div>
      </div>
    </div>
  );
};

export const PracticeRecordsPage = ({
  initialQuery,
}: {
  initialQuery: PracticeRecordsQuery;
}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const query = initialQuery;
  const recordsQuery = useQuery(practiceRecordQueryOptions.list(query));
  const error = recordsQuery.error
    ? normalizePracticeRecordsError(recordsQuery.error)
    : null;
  const fallbackRecords = useMemo(() => createMockPracticeRecords(query), [query]);
  const records = error ? fallbackRecords : (recordsQuery.data?.records ?? []);
  const total = error ? fallbackRecords.length : (recordsQuery.data?.total ?? 0);
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const loading = recordsQuery.isLoading || isPending;

  const navigate = (nextQuery: PracticeRecordsQuery) => {
    startTransition(() => {
      router.push(`${pathname}${createQueryString(nextQuery)}`, {
        scroll: false,
      });
    });
  };

  const handleSearch = (value: PracticeRecordsFilterValues) => {
    navigate({ ...query, ...value, pageNo: 1 });
  };

  const handleReset = () => {
    navigate({ ...query, repositoryName: "", practiceName: "", pageNo: 1 });
  };

  const summaryDescription = error
    ? "数据服务暂时不可用，已切换到示例练习记录，保障页面可读和可操作。"
    : records.length === 0
      ? "当前账号还没有可展示的练习记录。"
      : "列表按照题库、练习模式、正确率、提交时间和结果入口组织练习记录。";

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
                loading={loading}
                error={error}
                isFallback={Boolean(error)}
              />
            </MotionReveal>

            <MotionReveal direction="up" delay={0.08}>
              <div className="grid gap-4 rounded-[28px] border border-border/80 bg-card/88 p-5 shadow-[0_18px_48px_color-mix(in_oklab,var(--foreground)_6%,transparent)] md:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Filter
                  </p>
                  <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-foreground">
                    快速筛出需要复盘的训练记录
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    用题库名称和练习模式收窄记录，快速定位需要回看的专项训练。
                  </p>
                </div>

                <PracticeRecordsFilters
                  key={`${query.repositoryName}-${query.practiceName}`}
                  defaultValues={{
                    repositoryName: query.repositoryName,
                    practiceName: query.practiceName,
                  }}
                  pending={loading}
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
              <PracticeRecordsResults
                records={records}
                loading={loading}
                error={error}
                isFallback={Boolean(error)}
                filters={query}
                onRetry={() => {
                  void recordsQuery.refetch();
                }}
              />
            </div>

            <ResultsPagination
              page={Math.min(query.pageNo, pageCount)}
              pageCount={pageCount}
              total={total}
              pending={loading}
              itemLabel="条练习记录"
              onPageChange={(page) => navigate({ ...query, pageNo: page })}
            />

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
