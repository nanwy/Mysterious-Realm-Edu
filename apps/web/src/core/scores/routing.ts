import { EXAM_PASSED_STATE } from "@workspace/api";
import { SCORE_PASS_STATE } from "./config";

type RouteParam = string | string[] | undefined;

export const resolveScorePageParam = (value: RouteParam) => {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
};

export const resolveScoreKeywordParam = (value: RouteParam) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
};

export const resolveScorePassedParam = (value: RouteParam) => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === SCORE_PASS_STATE.PASSED) {
    return EXAM_PASSED_STATE.PASSED;
  }

  if (raw === SCORE_PASS_STATE.FAILED) {
    return EXAM_PASSED_STATE.NOT_PASSED;
  }

  return undefined;
};
