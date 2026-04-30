export type MessageDateTime = string;
export type MessageIntegerParam = number | string;

export interface MessagePageResponse<TRecord> {
  records: TRecord[];
  total: number;
  size?: number;
  current?: number;
  pages?: number;
  searchCount?: boolean;
}

export interface BusinessMessage {
  /** id | @Schema id */
  id?: string;
  /** 标题 | @Schema 标题 */
  title?: string;
  /** 内容 | @Schema 内容 */
  msgContent?: string;
  /** 消息类型，1：课程消息，2考试消息 | @Schema 消息类型 */
  msgType?: string;
  /** 业务数据id | @Schema 业务数据id */
  dataId?: string;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 创建时间 | @Schema 创建时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: MessageDateTime;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 更新时间 | @Schema 更新时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: MessageDateTime;
  /** 通知用户 */
  userIds?: string;
  /** 查询谁的消息 */
  userId?: string;
  readFlag?: number;
}

export interface BusinessMessageDTO {
  title?: string;
  msgContent?: string;
  msgType?: string;
  /** 消息接收用户 */
  userIds?: string;
  userNames?: string;
  /** 业务数据id */
  dataId?: string;
}

export interface BusinessMessageUser {
  /** id | @Schema id */
  id?: string;
  /** 通告ID | @Schema 通告ID */
  messageId?: string;
  /** 用户id | @Schema 用户id */
  userId?: string;
  /** 阅读状态（0未读，1已读） | @Schema 阅读状态（0未读，1已读） */
  readFlag?: number;
  /** 阅读时间 | @Schema 阅读时间 | @JsonFormat yyyy-MM-dd */
  readTime?: MessageDateTime;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 创建时间 | @Schema 创建时间 | @JsonFormat yyyy-MM-dd */
  createTime?: MessageDateTime;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 更新时间 | @Schema 更新时间 | @JsonFormat yyyy-MM-dd */
  updateTime?: MessageDateTime;
}

export interface SystemAnnouncement {
  /** id */
  id?: string;
  /** 标题 */
  titile?: string;
  /** 内容 */
  msgContent?: string;
  /** 开始时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  startTime?: MessageDateTime;
  /** 结束时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  endTime?: MessageDateTime;
  /** 发布人 | @Dict sys_user.username -> realname */
  sender?: string;
  /** 优先级（L低，M中，H高） | @Dict priority */
  priority?: string;
  /** 消息类型1:通知公告2:系统消息 | @Dict msg_category */
  msgCategory?: string;
  /** 通告对象类型（USER:指定用户，ALL:全体用户） | @Dict msg_type */
  msgType?: string;
  /** 发布状态（0未发布，1已发布，2已撤销） | @Dict send_status */
  sendStatus?: string;
  /** 发布时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  sendTime?: MessageDateTime;
  /** 撤销时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  cancelTime?: MessageDateTime;
  /** 删除状态（0，正常，1已删除） */
  delFlag?: string;
  createBy?: string;
  /** 创建时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: MessageDateTime;
  updateBy?: string;
  /** 更新时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: MessageDateTime;
  /** 指定用户 */
  userIds?: string;
  /** 业务类型(email:邮件 bpm:流程 tenant_invite:租户邀请) */
  busType?: string;
  /** 业务id */
  busId?: string;
  /** 打开方式 组件：component 路由：url */
  openType?: string;
  /** 组件/路由 地址 */
  openPage?: string;
  /** 摘要/扩展业务参数 */
  msgAbstract?: string;
  /** 阅读状态 1表示已经阅读 */
  readFlag?: string | number;
  /** 标星状态 1表示标星 */
  starFlag?: string;
  /** 发送记录ID */
  sendId?: string;
  /** 租户ID */
  tenantId?: number;
  /** 查询谁的消息 */
  userId?: string;
  /** 通知类型(system:系统消息、file:知识库、flow:流程、plan:日程计划、meeting:会议) */
  noticeType?: string;
  /** 附件字段 */
  files?: string;
  /** 访问次数 */
  visitsNum?: number;
  /** 是否置顶（0否 1是） */
  izTop?: number;
  /** 是否审批（0否 1是） */
  izApproval?: string;
  /** 流程状态 */
  bpmStatus?: string;
  /** 消息归类 */
  msgClassify?: string;
}

export interface SystemAnnouncementListRequest {
  announcement?: SystemAnnouncement;
  pageNo?: MessageIntegerParam;
  pageSize?: MessageIntegerParam;
}

export interface BusinessMessageListRequest {
  businessMessage?: BusinessMessage;
  pageNo?: MessageIntegerParam;
  pageSize?: MessageIntegerParam;
}

export interface MessageIdRequest {
  id: string | number;
}

export interface UnreadMessageCountResponse {
  announcementNum?: number;
  businessMessageNum?: number;
}

export type SystemMessageListResponse = MessagePageResponse<SystemAnnouncement>;
export type BusinessMessageListResponse = MessagePageResponse<BusinessMessage>;
export type AnnouncementListResponse = SystemAnnouncement[];
