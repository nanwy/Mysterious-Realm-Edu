import { EXAM_PASSED_STATE } from "@workspace/api";

export const SCORES_PAGE_SIZE = 10;

export const SCORE_PASS_STATE = {
  ALL: "",
  PASSED: `${EXAM_PASSED_STATE.PASSED}`,
  FAILED: `${EXAM_PASSED_STATE.NOT_PASSED}`,
} as const;

export const SCORE_PASS_OPTIONS = [
  { value: SCORE_PASS_STATE.ALL, label: "全部成绩" },
  { value: SCORE_PASS_STATE.PASSED, label: "已通过考试" },
  { value: SCORE_PASS_STATE.FAILED, label: "未通过考试" },
] as const;
