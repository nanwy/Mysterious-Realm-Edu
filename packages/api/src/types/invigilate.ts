export enum INVIGILATE_CHEAT_TYPE {
  SCREEN_SWITCH = 1,
}

export type InvigilateCheatType = INVIGILATE_CHEAT_TYPE;

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
