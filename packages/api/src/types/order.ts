import type { CourseDetailResponse, CourseListRequest } from "./course";
import type { ExamListRequest, ExamSummaryResponse } from "./exam";

export type OrderDateTime = string;
export type OrderIntegerParam = number | string;

export interface OrderPageResponse<TRecord> {
  records: TRecord[];
  total: number;
  size?: number;
  current?: number;
  pages?: number;
  searchCount?: boolean;
}

export interface OrderDTO {
  /** 购物车购买：1，立即购买：2 */
  way?: number;
  /** 客户端：H5/移动端 PC/PC端,WECHAT_MP/小程序端,APP/移动应用端 */
  clientType?: string;
  /** 是否为其他订单下的订单，如果是则为依赖订单的sn，否则为空 */
  parentOrderSn?: string;
  addressId?: string;
  goodsId?: string;
  goodsType?: OrderIntegerParam;
  /** 商品数量 */
  number?: number;
  freightPrice?: number;
  pageNo?: OrderIntegerParam;
  pageSize?: OrderIntegerParam;
  orderSn?: string;
  orderStatus?: OrderIntegerParam;
}

export interface OrderGoods {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 订单Id | @Schema 订单Id */
  orderId?: string;
  /** 商品id | @Schema 商品id */
  goodsId?: string;
  /** 商品类型 | @Schema 商品类型 */
  goodsType?: number;
  /** 商品名称 | @Schema 商品名称 */
  goodsName?: string;
  /** 图片链接 | @Schema 图片链接 */
  goodsImage?: string;
  /** 市场价 | @Schema 市场价 */
  goodsPrice?: number;
  /** 商品数量 | @Schema 商品数量 */
  number?: number;
  /** 购买时的成交价 | @Schema 购买时的成交价 */
  purchasePrice?: number;
  /** 评价状态 | @Schema 评价状态 */
  commentStatus?: number;
  /** 小计 | @Schema 小计 */
  subTotal?: number;
  /** createBy | @Schema createBy */
  createBy?: string;
  /** createTime | @Schema createTime | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: OrderDateTime;
  /** updateBy | @Schema updateBy */
  updateBy?: string;
  /** updateTime | @Schema updateTime | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: OrderDateTime;
}

export interface PurchaseOrder {
  /** id | @Schema id */
  id?: string;
  /** 用户id | @Schema 用户id */
  userId?: string;
  /** 订单来源 | @Schema 订单来源 */
  clientType?: string;
  /** 订单标题 | @Schema 订单标题 */
  orderTitle?: string;
  /** 订单编号 | @Schema 订单编号 */
  orderSn?: string;
  /** 支付方式返回的交易号 | @Schema 支付方式返回的交易号 */
  payOrderNo?: string;
  /** 支付时间 | @Schema 支付时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  payTime?: OrderDateTime;
  /** 支付方式 | @Schema 支付方式 | @Dict pay_method */
  payMethod?: string;
  /** 支付状态 | @Schema 支付状态 | @Dict pay_status */
  payStatus?: number;
  /** 商品总数量 | @Schema 商品总数量 */
  goodsNumber?: number;
  /** 商品总价 | @Schema 商品总价 */
  goodsPrice?: number;
  /** 订单总价 | @Schema 订单总价 */
  orderPrice?: number;
  /** 实际需要支付的金额 | @Schema 实际需要支付的金额 */
  actualPrice?: number;
  /** 是否需要发票 | @Schema 是否需要发票 */
  needInvoice?: boolean;
  /** 发票id | @Schema 发票id */
  invoiceId?: string;
  /** 是否为其他订单下的订单，如果是则为依赖订单的sn，否则为空 */
  parentOrderSn?: string;
  /** 订单类型 | @Schema 订单类型 */
  orderType?: string;
  /** 买家订单备注 | @Schema 买家订单备注 */
  remark?: string;
  /** 订单取消原因 | @Schema 订单取消原因 */
  cancelReason?: string;
  /** 订单状态 | @Schema 订单状态 | @Dict order_status */
  orderStatus?: number;
  /** 卖家id | @Schema 卖家id */
  sellerId?: string;
  /** 卖家姓名 | @Schema 卖家姓名 */
  sellerName?: string;
  /** 订单确认时间 | @Schema 订单确认时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  confirmTime?: OrderDateTime;
  /** 订单完成时间 | @Schema 订单完成时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  completeTime?: OrderDateTime;
  /** 是否包含子订单 | @Schema 是否包含子订单 */
  containSuborder?: boolean;
  /** createBy | @Schema createBy */
  createBy?: string;
  /** createTime | @Schema createTime | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: OrderDateTime;
  /** updateBy | @Schema updateBy */
  updateBy?: string;
  /** updateTime | @Schema updateTime | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: OrderDateTime;
  goodsList?: OrderGoods[];
  createByName?: string;
}

export interface OrderGoodsEvaluation {
  /** ID | @Schema ID */
  id?: string;
  /** 订单号 | @Schema 订单号 */
  orderSn?: string;
  /** 订单商品id | @Schema 订单商品id */
  orderGoodsId?: string;
  /** 商品类型 | @Schema 商品类型 | @Dict goods_type */
  goodsType?: number;
  /** 评价人ID | @Schema 评价人ID | @Dict sys_user.id -> realname */
  userId?: string;
  /** 商品ID | @Schema 商品ID */
  goodsId?: string;
  /** 商品名称 | @Schema 商品名称 */
  goodsName?: string;
  /** 商品图片 | @Schema 商品图片 */
  goodsImage?: string;
  /** 卖家ID | @Schema 卖家ID */
  sellerId?: string;
  /** 卖家名称 | @Schema 卖家名称 */
  sellerName?: string;
  /** 综合评价 | @Schema 综合评价 */
  ceScore?: number;
  /** 好中差评 | @Schema 好中差评 */
  grade?: string;
  /** 评价图片 | @Schema 评价图片 */
  images?: string;
  /** 评价内容 | @Schema 评价内容 */
  content?: string;
  /** 评论父级的id | @Schema 评论父级的id */
  parentId?: string;
  /** 被回复评论的id | @Schema 被回复评论的id */
  replyId?: string;
  /** 被回复人的id | @Schema 被回复人的id */
  replyUserId?: string;
  /** 用户是否点赞 | @Schema 用户是否点赞 */
  isLike?: boolean;
  /** 点赞数统计 | @Schema 点赞数统计 */
  likeCount?: number;
  /** 状态 | @Schema 状态 */
  status?: number;
  /** 审核记录id */
  auditRecordId?: string;
  /** 审批意见 */
  auditOpinion?: string;
  /** 审核时间 */
  auditTime?: OrderDateTime;
  /** 创建者 | @Schema 创建者 */
  createBy?: string;
  /** 创建时间 | @Schema 创建时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: OrderDateTime;
  /** 更新者 | @Schema 更新者 */
  updateBy?: string;
  /** 更新时间 | @Schema 更新时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: OrderDateTime;
  realname?: string;
  avatar?: string;
  replyName?: string;
}

export interface OrderSnRequest {
  orderSn: string;
}

export interface GoodsPurchasedRequest {
  goodsId: string | number;
  goodsType: string | number;
}

export interface DeleteEvaluationRequest {
  evaluationId: string | number;
}

export type CreateOrderRequest = OrderDTO;
export type CreateOrderResponse = string;
export type OrderListRequest = OrderDTO;
export type OrderListResponse = OrderPageResponse<PurchaseOrder>;
export type OrderDetailResponse = PurchaseOrder;
export type SellOrderListRequest = OrderDTO;
export type SellOrderListResponse = OrderPageResponse<PurchaseOrder>;
export type SellOrderDetailResponse = PurchaseOrder;
export type OrderEvaluationRequest = OrderGoodsEvaluation;
export type OrderEvaluationReplyResponse = OrderGoodsEvaluation;
export type GoodsPurchasedResponse = boolean;
export type PurchaseCourseListRequest = CourseListRequest;
export type PurchaseCourseListResponse = OrderPageResponse<CourseDetailResponse>;
export type PurchaseExamListRequest = ExamListRequest;
export type PurchaseExamListResponse = OrderPageResponse<ExamSummaryResponse>;
