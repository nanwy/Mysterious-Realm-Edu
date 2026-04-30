export type PayDateTime = string;

export interface PayDTO {
  /** 支付商家 */
  clientType?: string;
  /** h5，app,小程序，pc等的支付客户端 */
  paymentType?: string;
  /** 价格，单位元 */
  price?: number;
  description?: string;
  /** 订单编号 */
  orderSn?: string;
}

export interface PayResultRequest {
  orderSn: string;
}

export interface WechatH5PaymentResponse {
  h5Url?: string;
}

export interface WechatRequestPaymentResponse {
  appId?: string;
  appid?: string;
  partnerId?: string;
  partnerid?: string;
  prepayId?: string;
  prepayid?: string;
  packageVal?: string;
  package?: string;
  nonceStr?: string;
  noncestr?: string;
  timeStamp?: string;
  timestamp?: string;
  signType?: string;
  paySign?: string;
  sign?: string;
}

export type PaymentRequest = PayDTO;
export type PaymentResponse =
  | string
  | WechatH5PaymentResponse
  | WechatRequestPaymentResponse;
export type PayResultResponse = boolean;
