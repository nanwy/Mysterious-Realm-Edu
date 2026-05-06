import type { QuestionnaireListRequest } from "@workspace/api";

type RouteParam = string | string[] | undefined;

const firstParam = (value: RouteParam) =>
  Array.isArray(value) ? value[0] : value;

export const resolveQuestionnairePageParam = (value: RouteParam) => {
  const page = Number(firstParam(value));
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
};

export const resolveQuestionnaireKeywordParam = (
  value: RouteParam
): QuestionnaireListRequest["name"] => {
  const raw = firstParam(value);
  return typeof raw === "string" ? raw.trim() : "";
};
