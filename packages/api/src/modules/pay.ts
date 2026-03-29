import { createApiClient } from "../client";

const client = createApiClient();

export function pay(payload: Record<string, unknown>) {
  return client.post("/pay/payment", payload);
}

export function payResult(orderSn: string) {
  return client.get(`/pay/payResult?orderSn=${orderSn}`);
}

