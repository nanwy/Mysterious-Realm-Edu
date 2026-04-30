// Generated draft from Java sources. Review before using as API contract.
// Backend: /Users/nanfugongmeiying/Desktop/project/exam-backend-master
// Domain: pay

export type PayDateTime = string;

// ../exam-backend-master/web/src/main/java/com/ynfy/app/api/v1/entity/dto/PayDTO.java
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

