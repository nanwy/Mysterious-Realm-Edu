"use client";

import { getBusinessMessageList, getSystemMessageList, unwrapEnvelope } from "@workspace/api";
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
import { AlertCircle, BellRing, BriefcaseBusiness, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { ResultsPagination } from "@/components/common/results-pagination";
import { stripHtmlTags, toNumber, toRecord, toText } from "@/lib/normalize";

type MessageTab = "system" | "business";

interface MessageQuery {
  tab: MessageTab;
  pageNo: number;
  pageSize: number;
}

interface MessageRecord {
  id: string;
  title: string;
  sendTime: string;
  contentHtml: string;
  summary: string;
  contentType: "富文本" | "文本";
}

interface MessageListPayload {
  records?: unknown[];
  total?: number;
}

const DEFAULT_QUERY: MessageQuery = {
  tab: "system",
  pageNo: 1,
  pageSize: 10,
};

const TAB_META: Record<
  MessageTab,
  {
    label: string;
    eyebrow: string;
    summary: string;
    detail: string;
    Icon: typeof BellRing;
  }
> = {
  system: {
    label: "系统消息",
    eyebrow: "System Inbox",
    summary: "平台广播、账号提醒和教务通知会汇总在这里，适合快速确认全局变化。",
    detail: "适合先扫一遍平台状态，再决定是否进入课程、考试或账户操作。",
    Icon: BellRing,
  },
  business: {
    label: "业务消息",
    eyebrow: "Service Inbox",
    summary: "课程服务、学习链路和业务流转提醒集中在这里，帮助你继续主线任务。",
    detail: "更偏向和具体学习动作相关的通知，读完后通常会继续跳转处理下一步。",
    Icon: BriefcaseBusiness,
  },
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "消息接口暂时不可用，请稍后重试。";
}

function normalizeMessageRecord(item: unknown, index: number): MessageRecord {
  const record = toRecord(item);
  const title =
    toText(record.title) ||
    toText(record.titile) ||
    toText(record.msgTitle) ||
    `消息 ${index + 1}`;
  const sendTime =
    toText(record.createTime) ||
    toText(record.sendTime) ||
    toText(record.updateTime) ||
    "待补充时间";
  const contentHtml =
    toText(record.msgContent) ||
    toText(record.content) ||
    toText(record.messageContent) ||
    "<p>暂无消息内容。</p>";
  const summary = stripHtmlTags(contentHtml) || "暂无消息摘要。";
  const identifier =
    record.id ?? record.messageId ?? record.msgId ?? record.announcementId ?? `${title}-${index}`;

  return {
    id: String(identifier),
    title,
    sendTime,
    contentHtml,
    summary,
    contentType: /<[^>]+>/.test(contentHtml) ? "富文本" : "文本",
  };
}

async function fetchMessages(query: MessageQuery) {
  const payload = {
    pageNo: query.pageNo,
    pageSize: query.pageSize,
  };
  const response =
    query.tab === "system"
      ? await getSystemMessageList(payload)
      : await getBusinessMessageList(payload);
  const unwrapped = unwrapEnvelope(response);
  const result = toRecord(unwrapped) as MessageListPayload;
  const records = Array.isArray(result.records) ? result.records.map(normalizeMessageRecord) : [];
  const total = toNumber(result.total);

  return { records, total };
}

function MessagesLoadingState() {
  return (
    <div className="grid gap-4" data-testid="messages-loading">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[28px] border border-border/80 bg-card/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
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

function OverviewMetric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-[1.8rem] font-black tracking-[-0.05em] text-foreground">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{note}</p>
    </div>
  );
}

function MessageList({
  records,
  activeTab,
  pageNo,
  pageSize,
}: {
  records: MessageRecord[];
  activeTab: MessageTab;
  pageNo: number;
  pageSize: number;
}) {
  const meta = TAB_META[activeTab];
  const Icon = meta.Icon;

  return (
    <MotionStagger className="grid gap-4" delayChildren={0.06} data-testid="messages-list">
      {records.map((message, index) => (
        <MotionItem key={message.id}>
          <article className="overflow-hidden rounded-[28px] border border-border/80 bg-card/92 shadow-[0_22px_50px_rgba(15,23,42,0.06)]">
            <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary"
                  >
                    <Icon className="mr-1 size-3.5" />
                    {meta.label}
                  </Badge>
                  <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                    #{(pageNo - 1) * pageSize + index + 1}
                  </span>
                  <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                    {message.contentType}
                  </span>
                </div>

                <h3 className="mt-4 text-[1.5rem] font-black tracking-[-0.04em] text-foreground">
                  {message.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{message.summary}</p>
              </div>

              <div className="border-t border-border/70 bg-muted/30 p-5 xl:border-t-0 xl:border-l">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Message Meta
                </p>
                <dl className="mt-4 grid gap-4">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">发送时间</dt>
                    <dd className="mt-1 text-sm font-semibold text-foreground">{message.sendTime}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">消息类别</dt>
                    <dd className="mt-1 text-sm font-semibold text-foreground">{meta.label}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">阅读方式</dt>
                    <dd className="mt-1 text-sm font-semibold text-foreground">
                      正文已保留原始{message.contentType}展示
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="border-t border-border/70 px-5 py-5 md:px-6">
              <div
                className="rounded-[24px] border border-border/70 bg-background/90 px-4 py-4 text-sm leading-7 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] [&_a]:font-semibold [&_a]:text-primary [&_br]:leading-7 [&_p]:my-0 [&_strong]:text-foreground dark:bg-background/60"
                dangerouslySetInnerHTML={{ __html: message.contentHtml }}
              />
            </div>
          </article>
        </MotionItem>
      ))}
    </MotionStagger>
  );
}

export function MessagesPageShell() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [records, setRecords] = useState<MessageRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);

    void fetchMessages(query)
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

  function handleTabChange(value: string) {
    const nextTab: MessageTab = value === "business" ? "business" : "system";

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
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const safePage = Math.min(Math.max(page, 1), pageCount);

    setQuery((current) => ({
      ...current,
      pageNo: safePage,
    }));
  }

  const meta = TAB_META[query.tab];
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const rangeStart = total === 0 ? 0 : (query.pageNo - 1) * query.pageSize + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(query.pageNo * query.pageSize, total);

  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Inbox"
          title="消息中心"
          description="保留旧版系统消息 / 业务消息双标签结构，但把首屏改造成可快速扫读的收件箱工作台：先确认频道状态，再进入正文阅读。"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
            <MotionReveal direction="up" delay={0.02}>
              <section className="relative overflow-hidden rounded-[28px] border border-border/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(240,245,255,0.92))] p-5 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:bg-[linear-gradient(160deg,rgba(15,23,42,0.92),rgba(15,23,42,0.72))] md:p-6">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(180deg,black,transparent_88%)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]" />
                <div className="relative">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-primary hover:bg-primary/10">
                      {meta.eyebrow}
                    </Badge>
                    <span className="text-sm font-medium text-muted-foreground">
                      当前频道：{meta.label}
                    </span>
                  </div>

                  <h3 className="mt-5 max-w-3xl text-[clamp(2rem,4vw,3.4rem)] font-black leading-[0.95] tracking-[-0.06em] text-foreground">
                    先把重要消息扫清，
                    <br />
                    再回到课程和考试主线。
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                    {meta.summary}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
                    <span className="rounded-full border border-border/70 bg-background/80 px-3 py-2">
                      当前显示 {rangeStart}-{rangeEnd} / {total || 0}
                    </span>
                    <span className="rounded-full border border-border/70 bg-background/80 px-3 py-2">
                      第 {query.pageNo} / {pageCount} 页
                    </span>
                    <span className="rounded-full border border-border/70 bg-background/80 px-3 py-2">
                      {isLoading ? "正在同步消息" : error ? "消息同步失败" : "消息同步正常"}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                    <div data-testid="messages-tabs">
                      <Tabs value={query.tab} onValueChange={handleTabChange}>
                        <TabsList className="grid w-full grid-cols-2 rounded-[18px] border border-border/70 bg-background/80 p-1">
                          <TabsTrigger value="system" className="rounded-[14px]">
                            系统消息
                          </TabsTrigger>
                          <TabsTrigger value="business" className="rounded-[14px]">
                            业务消息
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="system">
                          <div className="sr-only">系统消息列表</div>
                        </TabsContent>
                        <TabsContent value="business">
                          <div className="sr-only">业务消息列表</div>
                        </TabsContent>
                      </Tabs>
                    </div>

                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRetry}
                        className="w-full rounded-full px-4 lg:w-auto"
                      >
                        <RefreshCcw className="size-4" />
                        刷新当前频道
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            </MotionReveal>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <MotionReveal direction="up" delay={0.08}>
                <OverviewMetric
                  label="频道状态"
                  value={meta.label}
                  note={meta.detail}
                />
              </MotionReveal>
              <MotionReveal direction="up" delay={0.14}>
                <OverviewMetric
                  label="列表状态"
                  value={error ? "请求失败" : hasLoaded ? `${records.length} 条` : "加载中"}
                  note={
                    error
                      ? error
                      : "当前页正文会完整保留，适合直接在页内浏览，不必跳转二级详情。"
                  }
                />
              </MotionReveal>
              <MotionReveal direction="up" delay={0.2}>
                <OverviewMetric
                  label="分页节奏"
                  value={`第 ${query.pageNo} 页`}
                  note={`当前共 ${total} 条消息，单页 ${query.pageSize} 条，切换频道时会回到第一页。`}
                />
              </MotionReveal>
            </div>
          </div>
        </SurfaceCard>
      </MotionItem>

      <MotionItem>
        <SurfaceCard
          title={`${meta.label}列表`}
          description="列表保留 loading / empty / error 三种兜底状态；正文区域按阅读卡片展开，移动端先看摘要，展开后继续读完整内容。"
        >
          <div className="grid gap-6">
            <div data-testid="messages-list-region">
              {!hasLoaded || isLoading ? (
                <MessagesLoadingState />
              ) : error ? (
                <div className="grid gap-4">
                  <Alert>
                    <AlertCircle className="size-4" />
                    <AlertTitle>消息接口暂不可用</AlertTitle>
                    <AlertDescription>
                      当前无法加载{query.tab === "system" ? "系统" : "业务"}消息：{error}
                      。请确认已登录且接口环境可访问后重试。
                    </AlertDescription>
                  </Alert>
                  <div>
                    <Button type="button" onClick={handleRetry} className="rounded-full">
                      <RefreshCcw className="size-4" />
                      重试加载
                    </Button>
                  </div>
                </div>
              ) : records.length === 0 ? (
                <EmptyState
                  title="当前频道暂无消息"
                  description={`还没有可展示的${query.tab === "system" ? "系统" : "业务"}消息。你可以切换频道，或稍后重新刷新。`}
                />
              ) : (
                <MessageList
                  records={records}
                  activeTab={query.tab}
                  pageNo={query.pageNo}
                  pageSize={query.pageSize}
                />
              )}
            </div>

            <div data-testid="messages-pagination">
              <ResultsPagination
                page={query.pageNo}
                pageCount={pageCount}
                total={total}
                pending={isLoading}
                itemLabel="条消息"
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </SurfaceCard>
      </MotionItem>
    </MotionStagger>
  );
}
