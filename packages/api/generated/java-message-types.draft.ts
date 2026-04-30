// Generated draft from Java sources. Review before using as API contract.
// Backend: /Users/nanfugongmeiying/Desktop/project/exam-backend-master
// Domain: message

export type MessageDateTime = string;

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/message/businessmessage/entity/BusinessMessage.java
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

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/message/businessmessage/entity/dto/BusinessMessageDTO.java
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

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/message/businessmessageuser/entity/BusinessMessageUser.java
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

