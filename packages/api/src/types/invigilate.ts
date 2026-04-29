export enum INVIGILATE_CHEAT_TYPE {
  SCREEN_SWITCH = 1,
}

export enum INVIGILATE_USER_TYPE {
  EXAMINEE = 2,
}

export type InvigilateCheatType = INVIGILATE_CHEAT_TYPE;
export type InvigilateUserType = INVIGILATE_USER_TYPE;

export type InvigilateJsonValue =
  | string
  | number
  | boolean
  | null
  | InvigilateJsonObject
  | InvigilateJsonValue[];

export interface InvigilateJsonObject {
  [key: string]: InvigilateJsonValue;
}

export interface InvigilateCheatRequest {
  examId?: string;
  userExamId?: string;
  /** 作弊类型：1:切屏 */
  cheatType?: InvigilateCheatType;
}

export interface InvigilateCheatCountResponse {
  userId?: string;
  cheatNum?: number;
}

export interface InvigilateWebrtcRequest {
  /** 考试 id */
  examId?: string;
  /** 用户类型：2 考生 */
  userType?: InvigilateUserType;
  /** WebRTC offer，Java DTO 类型为 Object */
  offer?: InvigilateJsonObject;
  /** WebRTC answer，Java DTO 类型为 Object */
  answer?: InvigilateJsonObject;
  /** WebRTC ICE candidate，Java DTO 类型为 Object */
  candidate?: InvigilateJsonObject;
  /** 消息发送用户 id */
  fromUserId?: string;
  /** 消息接收用户 id */
  toUserId?: string;
  /** 监考消息内容 */
  messageContent?: string;
  /** 作弊类型 */
  cheatType?: InvigilateCheatType;
  /** 用户考试 id */
  userExamId?: string;
}

export type InvigilateMutationResponse = null;

export interface InvigilateSocketMessage {
  msgType?: string;
  msgTxt?: string | InvigilateJsonObject | InvigilateJsonObject[] | null;
  fromUserId?: string;
  toUserId?: string;
}
