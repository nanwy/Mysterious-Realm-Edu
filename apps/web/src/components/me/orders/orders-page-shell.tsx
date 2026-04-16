"use client";

import { startTransition, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  cancelOrder,
  deleteOrder,
  getOrderList,
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
  ClipboardList,
  ReceiptText,
  RefreshCcw,
  Search,
} from "lucide-react";
import { ResultsPagination } from "@/components/common/results-pagination";
import { resolveMediaUrl } from "@/lib/media";
import { toNumber, toRecordOrEmpty, toText } from "@/lib/normalize";

type OrderTab = "all" | "pending" | "review" | "completed";

interface OrdersQuery {
  tab: OrderTab;
  pageNo: number;
  pageSize: number;
  orderSn: string;
  orderStatus: string;
}

interface OrderGoodsItem {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
  kindLabel: string;
  commentStatus: number | null;
}

interface OrderListItem {
  id: string;
  orderSn: string;
  createdAt: string;
  actualPrice: number;
  statusCode: number | null;
  statusLabel: string;
  goods: OrderGoodsItem[];
}

interface OrdersListPayload {
  records?: unknown[];
  total?: number;
}

const PAGE_SIZE = 10;

const ORDER_TABS: Array<{
  value: OrderTab;
  label: string;
  orderStatus: string;
  summary: string;
}> = [
  {
    value: "all",
    label: "全部订单",
    orderStatus: "",
    summary: "查看当前账号下所有订单，适合快速定位某笔历史交易。",
  },
  {
    value: "pending",
    label: "待付款",
    orderStatus: "0",
    summary: "聚焦还没完成支付的订单，避免漏掉需要继续处理的交易。",
  },
  {
    value: "review",
    label: "待评价",
    orderStatus: "1",
    summary: "保留旧页的待评价筛选，帮助你回看刚完成交付的课程或考试。",
  },
  {
    value: "completed",
    label: "已完成",
    orderStatus: "2",
    summary: "筛出已经完成的订单，方便核对金额、下单时间和购买内容。",
  },
];

const DEFAULT_QUERY: OrdersQuery = {
  tab: "all",
  pageNo: 1,
  pageSize: PAGE_SIZE,
  orderSn: "",
  orderStatus: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
  }).format(value);
}

function getOrderHeadline(order: OrderListItem) {
  if (order.goods.length === 0) {
    return "订单内容待补充";
  }

  if (order.goods.length === 1) {
    return order.goods[0]?.name ?? "订单内容待补充";
  }

  return `${order.goods[0]?.name ?? "订单内容待补充"} 等 ${order.goods.length} 项`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    if (error.message === "网络请求失败") {
      return "订单接口暂时不可用，请确认服务状态或稍后重试。";
    }

    return error.message;
  }

  return "订单接口暂时不可用，请稍后重试。";
}

function getStatusMeta(statusCode: number | null, statusLabel: string) {
  if (statusCode === 0) {
    return {
      label: statusLabel || "待付款",
      tone: "border-primary/20 bg-primary/10 text-primary",
      note: "支付链路尚未迁移，当前仅保留状态识别。",
    };
  }

  if (statusCode === 1) {
    return {
      label: statusLabel || "待评价",
      tone: "border-border/80 bg-background/80 text-foreground",
      note: "内容已交付，可在后续评价页迁移后补全反馈动作。",
    };
  }

  if (statusCode === 2) {
    return {
      label: statusLabel || "已完成",
      tone: "border-foreground/10 bg-foreground text-background dark:bg-foreground dark:text-background",
      note: "订单已完成，适合核对购买明细与金额。",
    };
  }

  if (statusCode === 3 || statusCode === 5) {
    return {
      label: statusLabel || "已关闭",
      tone: "border-border/80 bg-muted/70 text-muted-foreground",
      note: "订单已进入关闭态，可保留记录但不再继续流转。",
    };
  }

  if (statusCode === 6) {
    return {
      label: statusLabel || "退款中",
      tone: "border-border/80 bg-muted/70 text-foreground",
      note: "售后链路尚未迁移，当前仅展示退款相关状态。",
    };
  }

  return {
    label: statusLabel || "状态待同步",
    tone: "border-border/80 bg-muted/70 text-muted-foreground",
    note: "接口没有返回明确状态说明，页面已用兜底文案承接。",
  };
}

function normalizeGoodsKind(value: unknown) {
  const normalized = toText(value);

  if (normalized === "1") {
    return "课程";
  }

  if (normalized === "2") {
    return "考试";
  }

  return normalized || "商品";
}

function normalizeOrderGoods(item: unknown, index: number): OrderGoodsItem {
  const record = toRecordOrEmpty(item);
  const identifier = record.id ?? record.orderGoodsId ?? `${index}`;

  return {
    id: String(identifier),
    name: toText(record.goodsName ?? record.title, `订单内容 ${index + 1}`),
    imageUrl: resolveMediaUrl(toText(record.goodsImage ?? record.coverImage, "")),
    price: toNumber(record.purchasePrice),
    quantity: Math.max(1, toNumber(record.number, 1)),
    kindLabel: normalizeGoodsKind(record.goodsType),
    commentStatus: Number.isFinite(toNumber(record.commentStatus, Number.NaN))
      ? toNumber(record.commentStatus, Number.NaN)
      : null,
  };
}

function normalizeOrder(item: unknown, index: number): OrderListItem {
  const record = toRecordOrEmpty(item);
  const goodsList = Array.isArray(record.goodsList) ? record.goodsList : [];
  const statusCode = toNumber(record.orderStatus, Number.NaN);

  return {
    id: toText(record.id ?? record.orderSn, `order-${index + 1}`),
    orderSn: toText(record.orderSn, `待补订单号-${index + 1}`),
    createdAt: toText(record.createTime ?? record.createAt ?? record.updateTime, "下单时间待同步"),
    actualPrice: toNumber(record.actualPrice),
    statusCode: Number.isFinite(statusCode) ? statusCode : null,
    statusLabel: toText(record.orderStatus_dictText ?? record.statusText ?? record.orderStatusText),
    goods: goodsList.map(normalizeOrderGoods),
  };
}

async function fetchOrders(query: OrdersQuery) {
  const response = await getOrderList({
    pageNo: query.pageNo,
    pageSize: query.pageSize,
    orderSn: query.orderSn,
    orderStatus: query.orderStatus,
  });
  const unwrapped = unwrapEnvelope(response);
  const result = toRecordOrEmpty(unwrapped) as OrdersListPayload;
  const records = Array.isArray(result.records) ? result.records.map(normalizeOrder) : [];

  return {
    records,
    total: toNumber(result.total, records.length),
  };
}

function OrdersLoadingState() {
  return (
    <div className="grid gap-4" data-testid="orders-loading">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-[28px] border border-border/80 bg-card/90 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-8 w-56 rounded-full" />
          <div className="mt-5 grid gap-3">
            <Skeleton className="h-20 w-full rounded-[24px]" />
            <Skeleton className="h-20 w-full rounded-[24px]" />
          </div>
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
    <div className="rounded-[24px] border border-border/70 bg-background/85 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-[1.8rem] font-black tracking-[-0.05em] text-foreground">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{note}</p>
    </div>
  );
}

function OrderGoodsRow({ item }: { item: OrderGoodsItem }) {
  return (
    <div className="grid gap-4 rounded-[24px] border border-border/70 bg-background/85 p-4 md:grid-cols-[84px_minmax(0,1fr)_auto] md:items-center">
      <div className="overflow-hidden rounded-[18px] border border-border/70 bg-muted/50">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="h-[84px] w-full object-cover" />
        ) : (
          <div className="flex h-[84px] items-center justify-center text-xs text-muted-foreground">
            图片待同步
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full">
            {item.kindLabel}
          </Badge>
          {item.commentStatus === 1 ? (
            <Badge variant="outline" className="rounded-full">
              已评价
            </Badge>
          ) : null}
        </div>
        <h3 className="mt-3 text-base font-semibold text-foreground">{item.name}</h3>
      </div>

      <div className="grid gap-1 text-sm text-muted-foreground md:text-right">
        <span className="font-semibold text-foreground">{formatCurrency(item.price)}</span>
        <span>x {item.quantity}</span>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  actionPending,
  onCancel,
  onDelete,
}: {
  order: OrderListItem;
  actionPending: boolean;
  onCancel: (orderSn: string) => void;
  onDelete: (orderSn: string) => void;
}) {
  const statusMeta = getStatusMeta(order.statusCode, order.statusLabel);
  const canCancel = order.statusCode === 0;
  const canDelete = order.statusCode === 3 || order.statusCode === 5;
  const canRefund = order.statusCode === 1 || order.statusCode === 2 || order.statusCode === 6;

  return (
    <article className="overflow-hidden rounded-[28px] border border-border/80 bg-card/92 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`rounded-full border ${statusMeta.tone}`}>{statusMeta.label}</Badge>
                <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                  订单号 {order.orderSn}
                </span>
                <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                  共 {Math.max(order.goods.length, 1)} 项
                </span>
              </div>
              <div>
                <h3 className="text-[1.25rem] font-black tracking-[-0.04em] text-foreground">
                  {getOrderHeadline(order)}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  下单时间：{order.createdAt}
                </p>
              </div>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                实付金额
              </p>
              <p className="mt-2 text-[1.6rem] font-black tracking-[-0.05em] text-foreground">
                {formatCurrency(order.actualPrice)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {order.goods.length > 0 ? (
              order.goods.map((item) => <OrderGoodsRow key={item.id} item={item} />)
            ) : (
              <div className="rounded-[24px] border border-dashed border-border/80 bg-background/80 px-4 py-5 text-sm leading-7 text-muted-foreground">
                当前订单没有返回商品明细字段，页面已用占位说明承接，避免出现无内容空白区域。
              </div>
            )}
          </div>
        </div>

        <div
          className="border-t border-border/70 bg-muted/30 p-5 xl:border-l xl:border-t-0"
          data-testid="orders-actions"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Order Actions
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{statusMeta.note}</p>

          <div className="mt-6 grid gap-3">
            <Button type="button" variant="outline" disabled>
              订单详情待迁移
            </Button>

            {canCancel ? (
              <Button type="button" variant="outline" disabled={actionPending} onClick={() => onCancel(order.orderSn)}>
                取消订单
              </Button>
            ) : null}

            {canDelete ? (
              <Button type="button" variant="outline" disabled={actionPending} onClick={() => onDelete(order.orderSn)}>
                删除订单
              </Button>
            ) : null}

            {order.statusCode === 0 ? (
              <Button type="button" disabled>
                支付链路待迁移
              </Button>
            ) : null}

            {canRefund ? (
              <Button type="button" variant="outline" disabled>
                售后链路待迁移
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export function OrdersPageShell() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [draftOrderSn, setDraftOrderSn] = useState(DEFAULT_QUERY.orderSn);
  const [records, setRecords] = useState<OrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [actionPendingSn, setActionPendingSn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  const activeMeta = useMemo(
    () => ORDER_TABS.find((item) => item.value === query.tab) ?? ORDER_TABS[0],
    [query.tab]
  );

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    void fetchOrders(query)
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

  function updateQuery(partial: Partial<OrdersQuery>) {
    setActionMessage(null);
    setIsPending(true);
    startTransition(() => {
      setQuery((current) => ({ ...current, ...partial }));
    });
  }

  function handleTabChange(value: string) {
    const nextTab = ORDER_TABS.find((item) => item.value === value)?.value ?? "all";
    const meta = ORDER_TABS.find((item) => item.value === nextTab) ?? ORDER_TABS[0];

    updateQuery({
      tab: nextTab,
      orderStatus: meta.orderStatus,
      pageNo: 1,
    });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateQuery({
      orderSn: draftOrderSn.trim(),
      pageNo: 1,
    });
  }

  function handlePageChange(page: number) {
    updateQuery({ pageNo: page });
  }

  function reloadOrders() {
    setActionMessage(null);
    setIsPending(true);
    setReloadVersion((value) => value + 1);
  }

  async function handleCancel(orderSn: string) {
    if (!window.confirm(`确认取消订单 ${orderSn} 吗？`)) {
      return;
    }

    setActionPendingSn(orderSn);
    setActionMessage(null);

    try {
      await cancelOrder(orderSn);
      setActionMessage(`订单 ${orderSn} 已取消，列表已刷新。`);
      reloadOrders();
    } catch (requestError) {
      setActionMessage(getErrorMessage(requestError));
    } finally {
      setActionPendingSn(null);
    }
  }

  async function handleDelete(orderSn: string) {
    if (!window.confirm(`确认删除订单 ${orderSn} 吗？`)) {
      return;
    }

    setActionPendingSn(orderSn);
    setActionMessage(null);

    try {
      await deleteOrder(orderSn);
      setActionMessage(`订单 ${orderSn} 已删除，列表已刷新。`);
      reloadOrders();
    } catch (requestError) {
      setActionMessage(getErrorMessage(requestError));
    } finally {
      setActionPendingSn(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const overviewItems = [
    {
      label: "当前分组",
      value: activeMeta.label,
      note: activeMeta.summary,
    },
    {
      label: "结果总数",
      value: error ? "接口异常" : isLoading ? "加载中" : `${total} 单`,
      note: "保留旧页的列表承接关系，同时把 loading、empty 和 error 做成页面内状态。",
    },
    {
      label: "检索条件",
      value: query.orderSn ? `#${query.orderSn}` : "未输入订单号",
      note: "可以按订单号检索，避免在长列表里手动翻找历史交易。",
    },
  ];

  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Orders"
          title="订单中心"
          description="沿用旧 Vue 我的订单页的状态切换、订单号检索和订单列表结构，但视觉上收敛到当前学员端的冷静排版与语义化 surface，不再回退到传统后台卡片页。"
        >
          <div className="grid gap-8 xl:grid-cols-[minmax(19rem,0.88fr)_minmax(0,1.5fr)] xl:items-start">
            <div className="grid gap-5 xl:sticky xl:top-6">
              <MotionReveal direction="up">
                <section className="grid gap-6 rounded-[32px] border border-border bg-muted/30 p-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge>真实接口</Badge>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        Order center
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold text-foreground">
                        先锁定状态，再定位这笔订单
                      </h2>
                      <p className="text-sm leading-7 text-muted-foreground">
                        桌面端把筛选区前置，帮助学员先决定看哪一类订单，再进入右侧订单流确认金额、时间和购买内容。
                      </p>
                    </div>
                  </div>

                  <MotionStagger className="grid gap-3" delayChildren={0.06}>
                    {overviewItems.map((item) => (
                      <MotionItem key={item.label}>
                        <OverviewMetric label={item.label} value={item.value} note={item.note} />
                      </MotionItem>
                    ))}
                  </MotionStagger>
                </section>
              </MotionReveal>

              <section className="grid gap-4 rounded-[32px] border border-border bg-card/80 p-5 shadow-sm">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">订单筛选</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    延续旧页 tab 分组和订单号检索，用更稳定的版面节奏承接高频筛选动作。
                  </p>
                </div>

                <Tabs value={query.tab} onValueChange={handleTabChange} data-testid="orders-filter-tabs">
                  <TabsList className="grid w-full grid-cols-2 rounded-[18px] border border-border/70 bg-background/80 p-1 md:grid-cols-4">
                    {ORDER_TABS.map((tab) => (
                      <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <form className="grid gap-3" onSubmit={handleSearchSubmit} data-testid="orders-search-region">
                  <label className="text-sm font-medium text-foreground" htmlFor="order-sn-search">
                    订单号搜索
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      id="order-sn-search"
                      value={draftOrderSn}
                      onChange={(event) => setDraftOrderSn(event.target.value)}
                      placeholder="输入订单号快速检索"
                    />
                    <Button type="submit" className="sm:min-w-28" disabled={isPending}>
                      <Search className="size-4" />
                      查询
                    </Button>
                  </div>
                </form>

                <Button type="button" variant="outline" onClick={reloadOrders} disabled={isPending}>
                  <RefreshCcw className="size-4" />
                  刷新列表
                </Button>
              </section>

              <section className="grid gap-4 rounded-[32px] border border-border bg-card/80 p-5 shadow-sm">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">链路说明</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    详情、支付、售后页面还没迁到 Next.js，所以当前页只提供明确说明，不伪造跳转入口。
                  </p>
                </div>

                <div className="grid gap-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3 rounded-[20px] border border-border/70 bg-background/80 p-4">
                    <ReceiptText className="mt-0.5 size-4 shrink-0 text-foreground" />
                    <span>订单详情页暂未迁移，当前先完成列表承接与状态识别。</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-[20px] border border-border/70 bg-background/80 p-4">
                    <ClipboardList className="mt-0.5 size-4 shrink-0 text-foreground" />
                    <span>支付与售后链路暂不可进入，但页面会保留相关状态提示，避免误导用户。</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="grid gap-5">
              <MotionReveal direction="up">
                <SurfaceCard
                  title="订单列表"
                  description="列表中保留下单时间、订单号、金额、状态和商品明细等核心字段，并把操作区压缩成不会误导用户的占位动作。"
                >
                  <div className="grid gap-5" data-testid="orders-list-region">
                    {actionMessage ? (
                      <Alert>
                        <AlertCircle className="size-4" />
                        <AlertTitle>订单操作反馈</AlertTitle>
                        <AlertDescription>{actionMessage}</AlertDescription>
                      </Alert>
                    ) : null}

                    {error ? (
                      <Alert variant="destructive" data-testid="orders-error">
                        <AlertCircle className="size-4" />
                        <AlertTitle>订单读取失败</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    ) : null}

                    {isLoading ? <OrdersLoadingState /> : null}

                    {!isLoading && !error && records.length === 0 ? (
                      <EmptyState
                        title="暂时没有符合条件的订单"
                        description="当前筛选条件下没有返回订单记录。你可以切换状态分组、清空订单号检索，或稍后刷新重新查看。"
                      />
                    ) : null}

                    {!isLoading && !error ? (
                      <MotionStagger className="grid gap-4" delayChildren={0.05} data-testid="orders-list">
                        {records.map((order) => (
                          <MotionItem key={order.id}>
                            <OrderCard
                              order={order}
                              actionPending={actionPendingSn === order.orderSn}
                              onCancel={handleCancel}
                              onDelete={handleDelete}
                            />
                          </MotionItem>
                        ))}
                      </MotionStagger>
                    ) : null}
                  </div>
                </SurfaceCard>
              </MotionReveal>

              {!isLoading && !error && totalPages > 1 ? (
                <div data-testid="orders-pagination">
                  <ResultsPagination
                    page={query.pageNo}
                    pageCount={totalPages}
                    total={total}
                    pending={isPending}
                    itemLabel="笔订单"
                    onPageChange={handlePageChange}
                  />
                </div>
              ) : null}

              <MotionReveal direction="up">
                <SurfaceCard
                  title="当前迁移边界"
                  description="这一轮只把订单列表与筛选承接到 `/me/orders`。详情、支付、评价和售后仍需要后续页面迁移，不在这里伪造下一步。"
                >
                  <div className="grid gap-3 md:grid-cols-3">
                    <OverviewMetric label="已迁移" value="列表 / 筛选 / 分页" note="核心浏览链路已可访问，不再 404。" />
                    <OverviewMetric label="已兜底" value="Loading / Empty / Error" note="接口异常或空数据不会让页面崩掉。" />
                    <OverviewMetric label="待承接" value="详情 / 支付 / 售后" note="保留占位说明，等相关页面独立迁移。" />
                  </div>
                </SurfaceCard>
              </MotionReveal>
            </div>
          </div>
        </SurfaceCard>
      </MotionItem>
    </MotionStagger>
  );
}
