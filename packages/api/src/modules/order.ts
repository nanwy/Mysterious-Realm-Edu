import { createApiClient } from "../client";

const client = createApiClient();

export function createOrder(payload: Record<string, unknown>) {
  return client.post("/order/createOrder", payload);
}

export function getOrder(orderSn: string) {
  return client.get(`/order/getOrder?orderSn=${orderSn}`);
}

export function getOrderList(payload: Record<string, unknown>) {
  return client.post("/order/orderList", payload);
}

export function getOrderDetail(orderSn: string) {
  return client.get(`/order/detail/${orderSn}`);
}

export function cancelOrder(orderSn: string) {
  return client.get(`/order/cancel/${orderSn}`);
}

export function deleteOrder(orderSn: string) {
  return client.get(`/order/delete/${orderSn}`);
}

export function querySellOrder(payload: Record<string, unknown>) {
  return client.post("/order/querySellOrder", payload);
}

export function getSellOrderDetail(orderSn: string) {
  return client.get(`/order/sellOrderDetail/${orderSn}`);
}

export function addEvaluation(payload: Record<string, unknown>) {
  return client.post("/order/addEvaluation", payload);
}

export function addEvaluationReply(payload: Record<string, unknown>) {
  return client.post("/order/addEvaluationReply", payload);
}

export function getGoodsPurchased(goodsId: string | number, goodsType: string | number) {
  return client.get(`/order/getGoodsPurchased?goodsId=${goodsId}&goodsType=${goodsType}`);
}

export function deleteEvaluation(evaluationId: string | number) {
  return client.get(`/order/deleteEvaluation?evaluationId=${evaluationId}`);
}

export function selectPurchaseCourseList(payload: Record<string, unknown>) {
  return client.post("/order/selectPurchaseCourseList", payload);
}

export function selectPurchaseExamList(payload: Record<string, unknown>) {
  return client.post("/order/selectPurchaseExamList", payload);
}

