"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { getOrderList, unwrapEnvelope } from "@workspace/api";
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
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui";
import {
  AlertCircle,
  BadgeInfo,
  CircleDollarSign,
  Package2,
  ReceiptText,
  RefreshCcw,
  Search,
} from "lucide-react";
import { ResultsPagination } from "@/components/common/results-pagination";

type OrderTab = "all" | "pending-payment" | "pending-review" | "completed";
type OrderStatus = "" | "0" | "1" | "2";

interface OrderQuery {
  tab: OrderTab;
  orderStatus: OrderStatus;
  orderSn: string;
  pageNo: number;
  pageSize: number;
}

interface OrderGoodsItem {
  id: string;
  name: string;
  typeLabel: string;
  quantity: number;
  priceLabel: string;
}

interface OrderRecord {
  id: string;
  orderSn: string;
  createdAt: string;
  statusCode: string;
  statusLabel: string;
  payStatusLabel: string;
  actualPriceLabel: string;
  actualPriceValue: number;
  goodsCount: number;
  goodsSummary: string;
  goodsList: OrderGoodsItem[];
  detailHint: string;
}

interface OrderListPayload {
  records?: unknown[];
  total?: number;
}

const ORDER_TABS: Array<{
  value: OrderTab;
  label: string;
  orderStatus: OrderStatus;
}> = [
  { value: "all", label: "全部订单", orderStatus: "" },
  { value: "pending-payment", label: "待付款", orderStatus: "0" },
  { value: "pending-review", label: "待评价", orderStatus: "1" },
  { value: "completed", label: "已完成", orderStatus: "2" },
];

const DEFAULT_QUERY: OrderQuery = {
  tab: "all",
  orderStatus: "",
  orderSn: "",
  pageNo: 1,
  pageSize: 10,
};

const MOCK_ORDER_RECORDS: OrderRecord[] = [
  {
    id: "mock-order-1",
    orderSn: "MR202604010001",
    createdAt: "2026-04-01 10:24",
    statusCode: "0",
    statusLabel: "待付款",
    payStatusLabel: "未付款",
    actualPriceLabel: "￥199.00",
    actualPriceValue: 199,
    goodsCount: 1,
    goodsSummary: "Python 训练营",
    goodsList: [
      {
        id: "mock-goods-1",
        name: "Python 训练营",
        typeLabel: "课程",
        quantity: 1,
        priceLabel: "￥199.00",
      },
    ],
    detailHint: "订单详情页尚未迁入 /me/orders/[orderSn]，当前先保留占位说明。",
  },
  {
    id: "mock-order-2",
    orderSn: "MR202603280018",
    createdAt: "2026-03-28 18:06",
    statusCode: "1",
    statusLabel: "待评价",
    payStatusLabel: "已付款",
    actualPriceLabel: "￥398.00",
    actualPriceValue: 398,
    goodsCount: 2,
    goodsSummary: "实战课程 2 件",
    goodsList: [
      {
        id: "mock-goods-2",
        name: "前端架构实战课",
        typeLabel: "课程",
        quantity: 1,
        priceLabel: "￥299.00",
      },
      {
        id: "mock-goods-3",
        name: "考试冲刺题库",
        typeLabel: "考试",
        quantity: 1,
        priceLabel: "￥99.00",
      },
    ],
    detailHint: "本期只迁移列表、状态和详情入口占位，不包含评价或退款流程。",
  },
  {
    id: "mock-order-3",
    orderSn: "MR202603120007",
    createdAt: "2026-03-12 09:15",
    statusCode: "2",
    statusLabel: "已完成",
    payStatusLabel: "已付款",
    actualPriceLabel: "￥699.00",
    actualPriceValue: 699,
    goodsCount: 1,
    goodsSummary: "数据分析进阶班",
    goodsList: [
      {
        id: "mock-goods-4",
        name: "数据分析进阶班",
        typeLabel: "课程",
        quantity: 1,
        priceLabel: "￥699.00",
      },
    ],
    detailHint: "后续会将该入口接到真实订单详情页；本次先确保列表信息完整可读。",
  },
];

function toRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function toText(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function toNumberValue(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function formatCurrency(value: unknown, fallback = "￥0.00") {
  const amount = toNumberValue(value, Number.NaN);

  if (Number.isFinite(amount)) {
    return `￥${amount.toFixed(2)}`;
  }

  const text = toText(value);
  if (text) {
    return text.startsWith("￥") ? text : `￥${text}`;
  }

  return fallback;
}

function resolveStatusLabel(statusCode: string, sourceLabel: string) {
  if (sourceLabel) {
    return sourceLabel;
  }

  switch (statusCode) {
    case "0":
      return "待付款";
    case "1":
      return "待评价";
    case "2":
      return "已完成";
    case "3":
      return "已取消";
    case "5":
      return "已删除";
    case "6":
      return "退款处理中";
    default:
      return "状态待补充";
  }
}

function resolvePayStatusLabel(record: Record<string, unknown>) {
  const sourceLabel = toText(record.payStatus_dictText ?? record.payStatusText);
  if (sourceLabel) {
    return sourceLabel;
  }

  const payStatus = toText(record.payStatus);
  return payStatus === "1" ? "已付款" : "未付款";
}

function resolveGoodsTypeLabel(value: unknown) {
  const type = toText(value);

  if (type === "1") {
    return "课程";
  }

  if (type === "2") {
    return "考试";
  }

  return "商品";
}

function normalizeGoodsItem(item: unknown, index: number): OrderGoodsItem {
  const record = toRecord(item);
  const identifier = record.id ?? record.orderGoodsId ?? record.goodsId ?? `order-goods-${index + 1}`;
  const quantity = toNumberValue(record.number ?? record.quantity, 1);

  return {
    id: String(identifier),
    name: toText(record.goodsName ?? record.name, `商品 ${index + 1}`),
    typeLabel: resolveGoodsTypeLabel(record.goodsType),
    quantity,
    priceLabel: formatCurrency(record.purchasePrice ?? record.price, "￥0.00"),
  };
}

function normalizeOrderRecord(item: unknown, index: number): OrderRecord {
  const record = toRecord(item);
  const goodsList = Array.isArray(record.goodsList)
    ? record.goodsList.map(normalizeGoodsItem)
    : [];
  const statusCode = toText(record.orderStatus, "");
  const actualPriceValue = toNumberValue(record.actualPrice, 0);
  const goodsCount =
    toNumberValue(record.goodsNumber, 0) ||
    goodsList.reduce((sum, goods) => sum + goods.quantity, 0) ||
    goodsList.length;
  const primaryGoodsName = goodsList[0]?.name ?? "待补商品信息";
  const goodsSummary =
    goodsList.length > 1 ? `${primaryGoodsName} 等 ${goodsCount} 件` : primaryGoodsName;
  const orderSn = toText(record.orderSn, `ORDER-${index + 1}`);

  return {
    id: String(record.id ?? record.orderId ?? orderSn),
    orderSn,
    createdAt: toText(record.createTime ?? record.orderTime ?? record.updateTime, "待补下单时间"),
    statusCode,
    statusLabel: resolveStatusLabel(
      statusCode,
      toText(record.orderStatus_dictText ?? record.orderStatusText)
    ),
    payStatusLabel: resolvePayStatusLabel(record),
    actualPriceLabel: formatCurrency(record.actualPrice, "￥0.00"),
    actualPriceValue,
    goodsCount,
    goodsSummary,
    goodsList,
    detailHint: "订单详情页尚未迁入 /me/orders/[orderSn]，当前先保留详情入口占位说明。",
  };
}

function getOrderTabMeta(tab: string) {
  return ORDER_TABS.find((item) => item.value === tab) ?? ORDER_TABS[0];
}

function getErrorMessage(error: unknown) {
  const message =
    error instanceof Error && error.message ? error.message : "订单接口暂时不可用，请稍后重试。";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，已切换为 mock 订单数据。`;
  }

  if (message === "网络请求失败") {
    return "订单接口暂时不可用，请检查服务是否启动；当前已切换为 mock 订单数据。";
  }

  return `${message}，当前已切换为 mock 订单数据。`;
}

async function fetchOrders(query: OrderQuery) {
  const response = await getOrderList({
    pageNo: query.pageNo,
    pageSize: query.pageSize,
    orderSn: query.orderSn,
    orderStatus: query.orderStatus,
  });
  const payload = unwrapEnvelope(response);
  const result =
    payload && typeof payload === "object"
      ? (payload as OrderListPayload)
      : ({} as OrderListPayload);
  const records = Array.isArray(result.records) ? result.records.map(normalizeOrderRecord) : [];

  return {
    records,
    total: toNumberValue(result.total, records.length),
  };
}

function getMockOrders(query: OrderQuery) {
  const filtered = MOCK_ORDER_RECORDS.filter((record) => {
    const matchesStatus = query.orderStatus ? record.statusCode === query.orderStatus : true;
    const matchesOrderSn = query.orderSn
      ? record.orderSn.toLowerCase().includes(query.orderSn.toLowerCase())
      : true;

    return matchesStatus && matchesOrderSn;
  });
  const startIndex = (query.pageNo - 1) * query.pageSize;

  return {
    records: filtered.slice(startIndex, startIndex + query.pageSize),
    total: filtered.length,
  };
}

function OrdersLoadingState() {
  return (
    <div className="grid gap-3" data-testid="orders-loading">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-[24px] border border-border bg-card/90 p-5">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="mt-3 h-4 w-48 rounded-full" />
          <Skeleton className="mt-4 h-20 w-full rounded-[20px]" />
        </div>
      ))}
    </div>
  );
}

function OrderList({ records }: { records: OrderRecord[] }) {
  return (
    <MotionStagger className="grid gap-4" delayChildren={0.06} data-testid="orders-list">
      {records.map((order) => (
        <MotionItem key={order.id}>
          <article className="overflow-hidden rounded-[24px] border border-border bg-card/90 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-border bg-muted/30 px-5 py-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{order.statusLabel}</Badge>
                  <span className="text-sm text-muted-foreground">{order.payStatusLabel}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{order.goodsSummary}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  订单号：{order.orderSn} · 下单时间：{order.createdAt}
                </p>
              </div>
              <div className="md:text-right">
                <p className="text-sm text-muted-foreground">订单金额</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {order.actualPriceLabel}
                </p>
              </div>
            </div>

            <div className="grid gap-4 px-5 py-4">
              <div className="grid gap-3 rounded-[20px] border border-border/80 bg-background/80 px-4 py-4 dark:bg-muted/20">
                {order.goodsList.length ? (
                  order.goodsList.map((goods) => (
                    <div
                      key={goods.id}
                      className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{goods.name}</p>
                        <p className="mt-1">
                          {goods.typeLabel} · 数量 {goods.quantity}
                        </p>
                      </div>
                      <p>{goods.priceLabel}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">
                    当前订单未返回商品明细，页面已保留订单摘要和详情占位说明。
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 rounded-[20px] border border-dashed border-border bg-muted/20 px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div className="grid gap-1">
                  <p className="text-sm font-medium text-foreground" data-testid="orders-detail-entry">
                    订单详情入口
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">{order.detailHint}</p>
                </div>
                <Button type="button" variant="outline" disabled>
                  查看订单详情
                </Button>
              </div>
            </div>
          </article>
        </MotionItem>
      ))}
    </MotionStagger>
  );
}

export function OrdersPageShell() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [records, setRecords] = useState<OrderRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [dataSource, setDataSource] = useState<"api" | "mock">("api");
  const [reloadVersion, setReloadVersion] = useState(0);

  const form = useForm({
    defaultValues: {
      orderSn: DEFAULT_QUERY.orderSn,
    },
    onSubmit: ({ value }) => {
      setQuery((current) => ({
        ...current,
        orderSn: value.orderSn.trim(),
        pageNo: 1,
      }));
    },
  });

  useEffect(() => {
    form.reset({
      orderSn: query.orderSn,
    });
  }, [form, query.orderSn]);

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
        setDataSource("api");
        setHasLoaded(true);
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        const fallback = getMockOrders(query);

        setRecords(fallback.records);
        setTotal(fallback.total);
        setDataSource("mock");
        setError(getErrorMessage(requestError));
        setHasLoaded(true);
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, reloadVersion]);

  function handleTabChange(value: string) {
    const nextTab = getOrderTabMeta(value);

    setQuery((current) => ({
      ...current,
      tab: nextTab.value,
      orderStatus: nextTab.orderStatus,
      pageNo: 1,
    }));
  }

  function handleRetry() {
    setReloadVersion((value) => value + 1);
  }

  function handleResetSearch() {
    form.reset({
      orderSn: "",
    });
    setQuery((current) => ({
      ...current,
      orderSn: "",
      pageNo: 1,
    }));
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
  const currentTab = getOrderTabMeta(query.tab);

  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Orders"
          title="我的订单"
          description="迁移旧版学员端订单列表，保留状态筛选、订单号检索、订单摘要与详情入口占位；本期不实现退款、评价或支付流程。"
        >
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              <MotionReveal direction="up" delay={0.02}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ReceiptText className="size-4" />
                    <span>当前筛选</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">{currentTab.label}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    切换标签会重置到第一页，并重新请求对应订单状态。
                  </p>
                </div>
              </MotionReveal>
              <MotionReveal direction="up" delay={0.08}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package2 className="size-4" />
                    <span>列表状态</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {error ? "接口降级" : hasLoaded ? `${records.length} 条` : "加载中"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {error ?? "展示订单号、时间、状态、金额和商品摘要等核心字段。"}
                  </p>
                </div>
              </MotionReveal>
              <MotionReveal direction="up" delay={0.14}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CircleDollarSign className="size-4" />
                    <span>数据来源</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {dataSource === "api" ? "真实接口" : "Mock 数据"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {dataSource === "api"
                      ? "优先消费 packages/api 的订单模块。"
                      : "接口异常时使用内置 mock，保证页面不缺页也不崩。"}
                  </p>
                </div>
              </MotionReveal>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <Badge variant="outline">分页 {query.pageSize} 条/页</Badge>
              <Badge variant="outline">
                {query.orderSn ? `订单号检索：${query.orderSn}` : "未按订单号检索"}
              </Badge>
              <Badge variant="outline">
                {dataSource === "api" ? "当前为接口结果" : "当前为 mock 结果"}
              </Badge>
            </div>

            <div data-testid="orders-filters" className="grid gap-4">
              <Tabs value={query.tab} onValueChange={handleTabChange}>
                <TabsList aria-label="订单状态筛选">
                  {ORDER_TABS.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {ORDER_TABS.map((tab) => (
                  <TabsContent key={tab.value} value={tab.value}>
                    <div className="sr-only">{tab.label}订单列表</div>
                  </TabsContent>
                ))}
              </Tabs>

              <form
                className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]"
                onSubmit={(event) => {
                  event.preventDefault();
                  void form.handleSubmit();
                }}
              >
                <form.Field name="orderSn">
                  {(field) => (
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-foreground">订单号搜索</span>
                      <Input
                        id="orders-order-sn"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder="输入订单号筛选"
                      />
                    </label>
                  )}
                </form.Field>

                <div className="flex items-end">
                  <Button type="submit" disabled={isLoading}>
                    <Search className="size-4" />
                    搜索订单
                  </Button>
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={handleResetSearch}
                  >
                    重置筛选
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </SurfaceCard>
      </MotionItem>

      <MotionItem>
        <SurfaceCard
          title={`${currentTab.label}列表`}
          description="列表保留 loading / empty / error 三种状态；当接口失败时，会明确展示错误原因并回退到 mock 数据，同时保留详情入口占位。"
        >
          <div className="grid gap-6">
            <div data-testid="orders-list-region">
              {!hasLoaded || isLoading ? (
                <OrdersLoadingState />
              ) : (
                <div className="grid gap-4">
                  {error ? (
                    <Alert>
                      <AlertCircle className="size-4" />
                      <AlertTitle>订单接口暂不可用</AlertTitle>
                      <AlertDescription>
                        {error} 你仍然可以先核对页面结构、筛选区和详情入口占位。
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  {dataSource === "mock" ? (
                    <div className="flex items-start gap-3 rounded-[24px] border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                      <BadgeInfo className="mt-0.5 size-4 shrink-0" />
                      <p className="leading-6">
                        当前展示的是 mock 订单数据，用于承接缺页场景和接口异常兜底；字段结构与旧版订单列表保持一致。
                      </p>
                    </div>
                  ) : null}

                  {records.length === 0 ? (
                    <EmptyState
                      title="暂无订单"
                      description={
                        query.orderSn
                          ? `没有找到订单号包含“${query.orderSn}”的${currentTab.label === "全部订单" ? "" : currentTab.label}记录。`
                          : `当前没有可展示的${currentTab.label === "全部订单" ? "" : currentTab.label}记录。`
                      }
                    />
                  ) : (
                    <OrderList records={records} />
                  )}

                  {error ? (
                    <div>
                      <Button type="button" onClick={handleRetry}>
                        <RefreshCcw className="size-4" />
                        重试加载
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div data-testid="orders-pagination">
              <ResultsPagination
                page={query.pageNo}
                pageCount={pageCount}
                total={total}
                pending={isLoading}
                itemLabel="笔订单"
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </SurfaceCard>
      </MotionItem>
    </MotionStagger>
  );
}
