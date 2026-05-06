"use client";

import { queryOptions } from "@tanstack/react-query";
import type { QuestionnaireListRequest } from "@workspace/api";
import { fetchQuestionnaires } from "./api";

export const questionnaireKeys = {
  all: ["questionnaire"] as const,
  list: (query: QuestionnaireListRequest) =>
    [...questionnaireKeys.all, "list", query.name, query.pageNo] as const,
};

export const questionnaireQueryOptions = {
  list: (query: QuestionnaireListRequest) =>
    queryOptions({
      queryKey: questionnaireKeys.list(query),
      queryFn: () => fetchQuestionnaires(query),
    }),
};
