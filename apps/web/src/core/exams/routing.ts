import type { ExamListRequest } from "@workspace/api";
import { EXAM_STATUS, EXAM_TYPE } from "./config";

type RouteParam = string | string[] | undefined;

const firstParam = (value: RouteParam) =>
  Array.isArray(value) ? value[0] : value;

export const resolveExamPageParam = (value: RouteParam) => {
  const page = Number(firstParam(value));
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
};

export const resolveExamKeywordParam = (value: RouteParam) => {
  const raw = firstParam(value);
  return typeof raw === "string" ? raw.trim() : "";
};

export const resolveExamTypeParam = (
  value: RouteParam
): ExamListRequest["examType"] => {
  const raw = firstParam(value);
  return raw === EXAM_TYPE.MINE ? EXAM_TYPE.MINE : EXAM_TYPE.PUBLIC;
};

export const resolveExamStatusParam = (
  value: RouteParam
): ExamListRequest["state"] => {
  const raw = firstParam(value);
  if (
    raw === EXAM_STATUS.IN_PROGRESS ||
    raw === EXAM_STATUS.NOT_STARTED ||
    raw === EXAM_STATUS.ENDED
  ) {
    return raw;
  }

  return EXAM_STATUS.ALL;
};
