export const SCORES_PAGE_SIZE = 10;

export enum SCORE_PASS_STATE {
  ALL = "",
  PASSED = "1",
  FAILED = "0",
}

export type ScorePassFilter = SCORE_PASS_STATE;

export const SCORE_PASS_OPTIONS = [
  { value: SCORE_PASS_STATE.ALL, label: "全部成绩" },
  { value: SCORE_PASS_STATE.PASSED, label: "已通过考试" },
  { value: SCORE_PASS_STATE.FAILED, label: "未通过考试" },
] as const;

