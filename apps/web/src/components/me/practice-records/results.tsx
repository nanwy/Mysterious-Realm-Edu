"use client";

import { MotionItem, MotionStagger } from "@workspace/motion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  EmptyState,
  Skeleton,
} from "@workspace/ui";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ListFilter,
  RefreshCcw,
  Target,
} from "lucide-react";
import Link from "next/link";
import type {
  PracticeRecordItem,
  PracticeRecordsFilterValues,
} from "@/core/practice-records";

export const hasPracticeRecordFilters = (query: PracticeRecordsFilterValues) =>
  Boolean(query.repositoryName.trim() || query.practiceName.trim());

export const PracticeRecordsLoadingState = () => (
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

export const PracticeRecordsList = ({
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
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    用于判断本次训练的基础表现。
                  </p>
                </div>

                <div className="rounded-[22px] border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Target className="size-4 text-muted-foreground" />
                    正确率
                  </div>
                  <p className="mt-3 text-lg font-bold tracking-[-0.03em] text-foreground">
                    {record.accuracyLabel}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    缺少直接数值时会按答对 / 总题数推导。
                  </p>
                </div>

                <div className="rounded-[22px] border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Clock3 className="size-4 text-muted-foreground" />
                    提交时间
                  </div>
                  <p className="mt-3 text-lg font-bold tracking-[-0.03em] text-foreground">
                    {record.commitTime}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    用于还原本次训练发生的时间点。
                  </p>
                </div>

                <div className="rounded-[22px] border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ListFilter className="size-4 text-muted-foreground" />
                    练习模式
                  </div>
                  <p className="mt-3 text-lg font-bold tracking-[-0.03em] text-foreground">
                    {record.practiceName}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    用于筛选和结果复盘定位。
                  </p>
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

export const PracticeRecordsResults = ({
  records,
  loading,
  error,
  isFallback,
  filters,
  onRetry,
}: {
  records: PracticeRecordItem[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  filters: PracticeRecordsFilterValues;
  onRetry: () => void;
}) => {
  if (loading) {
    return <PracticeRecordsLoadingState />;
  }

  if (error) {
    return (
      <div className="grid gap-4">
        <Alert>
          <AlertCircle className="size-4" />
          <AlertTitle>练习记录暂时不可用</AlertTitle>
          <AlertDescription>
            当前无法完整加载练习记录：{error}。页面已提供示例记录，帮助你继续查看字段结构与分页行为。
          </AlertDescription>
        </Alert>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={onRetry}>
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
    );
  }

  if (records.length === 0) {
    return (
      <EmptyState
        title={hasPracticeRecordFilters(filters) ? "没有匹配的练习记录" : "当前还没有练习记录"}
        description={
          hasPracticeRecordFilters(filters)
            ? "请调整题库名称或练习模式关键词，或重置筛选后查看全部结果。"
            : "当你完成在线练习后，这里会展示题库、练习模式、正确率和结果入口。"
        }
      />
    );
  }

  return <PracticeRecordsList records={records} isFallback={isFallback} />;
};
