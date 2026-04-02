"use client";

import { getBusinessMessageList, getSystemMessageList, unwrapEnvelope } from "@workspace/api";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
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

function toRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function toStringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function toNumberValue(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stripHtmlTags(content: string) {
  return content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "消息接口暂时不可用，请稍后重试。";
}

function normalizeMessageRecord(item: unknown, index: number): MessageRecord {
  const record = toRecord(item);
  const title =
    toStringValue(record.title) ||
    toStringValue(record.titile) ||
    toStringValue(record.msgTitle) ||
    `消息 ${index + 1}`;
  const sendTime =
    toStringValue(record.createTime) ||
    toStringValue(record.sendTime) ||
    toStringValue(record.updateTime) ||
    "待补充时间";
  const contentHtml =
    toStringValue(record.msgContent) ||
    toStringValue(record.content) ||
    toStringValue(record.messageContent) ||
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
  const total = toNumberValue(result.total);

  return { records, total };
}

function MessagesLoadingState() {
  return (
    <div className="grid gap-3" data-testid="messages-loading">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-[24px] border border-border bg-card/90 p-5">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="mt-3 h-4 w-40 rounded-full" />
          <Skeleton className="mt-4 h-16 w-full rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

function MessageList({ records, activeTab }: { records: MessageRecord[]; activeTab: MessageTab }) {
  return (
    <MotionStagger className="grid gap-4" delayChildren={0.06} data-testid="messages-list">
      {records.map((message) => (
        <MotionItem key={message.id}>
          <article className="overflow-hidden rounded-[24px] border border-border bg-card/90 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-border bg-muted/30 px-5 py-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {activeTab === "system" ? (
                    <BellRing className="size-4" />
                  ) : (
                    <BriefcaseBusiness className="size-4" />
                  )}
                  <span>{activeTab === "system" ? "系统消息" : "业务消息"}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{message.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">发送时间：{message.sendTime}</p>
            </div>

            <div className="grid gap-4 px-5 py-4">
              <p className="text-sm leading-7 text-muted-foreground">{message.summary}</p>
              <div
                className="rounded-[20px] border border-border/80 bg-background/80 px-4 py-3 text-sm leading-7 text-foreground shadow-sm [&_a]:text-primary [&_p]:my-0 [&_strong]:text-foreground dark:bg-muted/20"
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

  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));

  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Messages"
          title="消息中心"
          description="迁移旧版系统消息 / 业务消息双标签结构，当前直接调用现有消息接口；若环境未配置或接口失败，会保留可读错误态。"
        >
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              <MotionReveal direction="up" delay={0.02}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <p className="text-sm text-muted-foreground">当前标签</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {query.tab === "system" ? "系统消息" : "业务消息"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    切换标签会重新读取对应消息列表，并重置到第一页。
                  </p>
                </div>
              </MotionReveal>
              <MotionReveal direction="up" delay={0.08}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <p className="text-sm text-muted-foreground">列表状态</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {error ? "请求失败" : hasLoaded ? `${records.length} 条` : "加载中"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {error ?? "列表展示标题、发送时间与正文内容，保留旧版消息阅读方式。"}
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
                    共 {total} 条消息，单页 {query.pageSize} 条。
                  </p>
                </div>
              </MotionReveal>
            </div>

            <div data-testid="messages-tabs">
              <Tabs value={query.tab} onValueChange={handleTabChange}>
                <TabsList aria-label="消息分类">
                  <TabsTrigger value="system">系统消息</TabsTrigger>
                  <TabsTrigger value="business">业务消息</TabsTrigger>
                </TabsList>
                <TabsContent value="system">
                  <div className="sr-only">系统消息列表</div>
                </TabsContent>
                <TabsContent value="business">
                  <div className="sr-only">业务消息列表</div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SurfaceCard>
      </MotionItem>

      <MotionItem>
        <SurfaceCard
          title={query.tab === "system" ? "系统消息列表" : "业务消息列表"}
          description="页面保留 loading / empty / error 三种接口兜底状态；当消息正文带富文本时，容器会维持 light/dark 下的可读性。"
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
                      当前无法加载{query.tab === "system" ? "系统" : "业务"}
                      消息：{error}。请确认已登录且接口环境可访问后重试。
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
                  title="暂无消息"
                  description={`当前没有可展示的${query.tab === "system" ? "系统" : "业务"}消息。`}
                />
              ) : (
                <MessageList records={records} activeTab={query.tab} />
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
