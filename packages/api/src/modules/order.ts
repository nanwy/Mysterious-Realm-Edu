import { createApiClient, type ApiHttpClient } from "../client";

type Id = string | number;

export const createOrderApi = (client: ApiHttpClient) => ({
  createOrder: (payload: Record<string, unknown>) =>
    client.post<unknown>("/order/createOrder", payload),

  getOrder: ({ orderSn }: { orderSn: string }) =>
    client.get<unknown>("/order/getOrder", {
      query: { orderSn },
    }),

  listOrders: (payload: Record<string, unknown>) =>
    client.post<unknown>("/order/orderList", payload),

  getOrderDetail: ({ orderSn }: { orderSn: string }) =>
    client.get<unknown>(`/order/detail/${encodeURIComponent(orderSn)}`),

  cancelOrder: ({ orderSn }: { orderSn: string }) =>
    client.get<unknown>(`/order/cancel/${encodeURIComponent(orderSn)}`),

  deleteOrder: ({ orderSn }: { orderSn: string }) =>
    client.get<unknown>(`/order/delete/${encodeURIComponent(orderSn)}`),

  querySellOrder: (payload: Record<string, unknown>) =>
    client.post<unknown>("/order/querySellOrder", payload),

  getSellOrderDetail: ({ orderSn }: { orderSn: string }) =>
    client.get<unknown>(`/order/sellOrderDetail/${encodeURIComponent(orderSn)}`),

  addEvaluation: (payload: Record<string, unknown>) =>
    client.post<unknown>("/order/addEvaluation", payload),

  addEvaluationReply: (payload: Record<string, unknown>) =>
    client.post<unknown>("/order/addEvaluationReply", payload),

  getGoodsPurchased: ({
    goodsId,
    goodsType,
  }: {
    goodsId: Id;
    goodsType: Id;
  }) =>
    client.get<unknown>("/order/getGoodsPurchased", {
      query: { goodsId, goodsType },
    }),

  deleteEvaluation: ({ evaluationId }: { evaluationId: Id }) =>
    client.get<unknown>("/order/deleteEvaluation", {
      query: { evaluationId },
    }),

  selectPurchaseCourseList: (payload: Record<string, unknown>) =>
    client.post<unknown>("/order/selectPurchaseCourseList", payload),

  selectPurchaseExamList: (payload: Record<string, unknown>) =>
    client.post<unknown>("/order/selectPurchaseExamList", payload),
});

const defaultOrderApi = createOrderApi(createApiClient());

export function createOrder(payload: Record<string, unknown>) {
  return defaultOrderApi.createOrder(payload);
}

export function getOrder(orderSn: string) {
  return defaultOrderApi.getOrder({ orderSn });
}

export function getOrderList(payload: Record<string, unknown>) {
  return defaultOrderApi.listOrders(payload);
}

export function getOrderDetail(orderSn: string) {
  return defaultOrderApi.getOrderDetail({ orderSn });
}

export function cancelOrder(orderSn: string) {
  return defaultOrderApi.cancelOrder({ orderSn });
}

export function deleteOrder(orderSn: string) {
  return defaultOrderApi.deleteOrder({ orderSn });
}

export function querySellOrder(payload: Record<string, unknown>) {
  return defaultOrderApi.querySellOrder(payload);
}

export function getSellOrderDetail(orderSn: string) {
  return defaultOrderApi.getSellOrderDetail({ orderSn });
}

export function addEvaluation(payload: Record<string, unknown>) {
  return defaultOrderApi.addEvaluation(payload);
}

export function addEvaluationReply(payload: Record<string, unknown>) {
  return defaultOrderApi.addEvaluationReply(payload);
}

export function getGoodsPurchased(goodsId: string | number, goodsType: string | number) {
  return defaultOrderApi.getGoodsPurchased({ goodsId, goodsType });
}

export function deleteEvaluation(evaluationId: string | number) {
  return defaultOrderApi.deleteEvaluation({ evaluationId });
}

export function selectPurchaseCourseList(payload: Record<string, unknown>) {
  return defaultOrderApi.selectPurchaseCourseList(payload);
}

export function selectPurchaseExamList(payload: Record<string, unknown>) {
  return defaultOrderApi.selectPurchaseExamList(payload);
}
