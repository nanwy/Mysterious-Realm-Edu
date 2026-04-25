import { createApiClient, type ApiHttpClient } from "../client";

export const createPayApi = (client: ApiHttpClient) => ({
  pay: (payload: Record<string, unknown>) =>
    client.post<unknown>("/pay/payment", payload),

  getPayResult: ({ orderSn }: { orderSn: string }) =>
    client.get<unknown>("/pay/payResult", {
      query: { orderSn },
    }),
});

const defaultPayApi = createPayApi(createApiClient());

export function pay(payload: Record<string, unknown>) {
  return defaultPayApi.pay(payload);
}

export function payResult(orderSn: string) {
  return defaultPayApi.getPayResult({ orderSn });
}
