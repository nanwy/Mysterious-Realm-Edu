import type { ApiHttpClient } from "../client";
import type {
  PaymentRequest,
  PaymentResponse,
  PayResultRequest,
  PayResultResponse,
} from "../types/pay";

export const createPayApi = (client: ApiHttpClient) => ({
  pay: (payload: PaymentRequest) =>
    client.post<PaymentResponse>("/pay/payment", payload),

  getPayResult: ({ orderSn }: PayResultRequest) =>
    client.get<PayResultResponse>("/pay/payResult", {
      query: { orderSn },
    }),
});
