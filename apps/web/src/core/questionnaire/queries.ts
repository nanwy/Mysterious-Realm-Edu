"use client";

import { queryOptions } from "@tanstack/react-query";
import { fetchQuestionnaires } from "./api";
import type { QuestionnaireQueryState } from "./types";

export const questionnaireKeys = {
  all: ["questionnaire"] as const,
  list: (query: QuestionnaireQueryState) =>
    [...questionnaireKeys.all, "list", query.keyword, query.page] as const,
};

export const questionnaireQueryOptions = {
  list: (query: QuestionnaireQueryState) =>
    queryOptions({
      queryKey: questionnaireKeys.list(query),
      queryFn: () => fetchQuestionnaires(query),
    }),
};

