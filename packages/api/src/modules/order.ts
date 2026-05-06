import type { ApiHttpClient } from "../client";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  DeleteEvaluationRequest,
  GoodsPurchasedRequest,
  GoodsPurchasedResponse,
  OrderDetailResponse,
  OrderEvaluationReplyResponse,
  OrderEvaluationRequest,
  OrderListRequest,
  OrderListResponse,
  OrderSnRequest,
  PurchaseCourseListRequest,
  PurchaseCourseListResponse,
  PurchaseExamListRequest,
  PurchaseExamListResponse,
  SellOrderDetailResponse,
  SellOrderListRequest,
  SellOrderListResponse,
} from "../types/order";

export const createOrderApi = (client: ApiHttpClient) => ({
  createOrder: (payload: CreateOrderRequest) =>
    client.post<CreateOrderResponse>("/order/createOrder", payload),

  getOrder: ({ orderSn }: OrderSnRequest) =>
    client.get<OrderDetailResponse>("/order/getOrder", {
      query: { orderSn },
    }),

  listOrders: (payload: OrderListRequest) =>
    client.post<OrderListResponse>("/order/orderList", payload),

  getOrderDetail: ({ orderSn }: OrderSnRequest) =>
    client.get<OrderDetailResponse>(`/order/detail/${encodeURIComponent(orderSn)}`),

  cancelOrder: ({ orderSn }: OrderSnRequest) =>
    client.get<void>(`/order/cancel/${encodeURIComponent(orderSn)}`),

  deleteOrder: ({ orderSn }: OrderSnRequest) =>
    client.get<void>(`/order/delete/${encodeURIComponent(orderSn)}`),

  querySellOrder: (payload: SellOrderListRequest) =>
    client.post<SellOrderListResponse>("/order/querySellOrder", payload),

  getSellOrderDetail: ({ orderSn }: OrderSnRequest) =>
    client.get<SellOrderDetailResponse>(
      `/order/sellOrderDetail/${encodeURIComponent(orderSn)}`
    ),

  addEvaluation: (payload: OrderEvaluationRequest) =>
    client.post<void>("/order/addEvaluation", payload),

  addEvaluationReply: (payload: OrderEvaluationRequest) =>
    client.post<OrderEvaluationReplyResponse>("/order/addEvaluationReply", payload),

  getGoodsPurchased: ({ goodsId, goodsType }: GoodsPurchasedRequest) =>
    client.get<GoodsPurchasedResponse>("/order/getGoodsPurchased", {
      query: { goodsId, goodsType },
    }),

  deleteEvaluation: ({ evaluationId }: DeleteEvaluationRequest) =>
    client.get<void>("/order/deleteEvaluation", {
      query: { evaluationId },
    }),

  selectPurchaseCourseList: (payload: PurchaseCourseListRequest) =>
    client.post<PurchaseCourseListResponse>("/order/selectPurchaseCourseList", payload),

  selectPurchaseExamList: (payload: PurchaseExamListRequest) =>
    client.post<PurchaseExamListResponse>("/order/selectPurchaseExamList", payload),
});
