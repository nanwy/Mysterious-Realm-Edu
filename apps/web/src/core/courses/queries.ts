"use client";

import { queryOptions } from "@tanstack/react-query";
import { fetchCourseList, fetchCourseStudy } from "./api";
import type { CourseFiltersState } from "./types";

export const courseKeys = {
  all: ["courses"] as const,
  list: (filters: CourseFiltersState) =>
    [
      ...courseKeys.all,
      "list",
      filters.keyword,
      filters.orderBy,
      filters.categoryId,
      filters.pageNo,
      filters.pageSize,
    ] as const,
  study: (courseId: string) => [...courseKeys.all, "study", courseId] as const,
};

export const courseQueryOptions = {
  list: (filters: CourseFiltersState) =>
    queryOptions({
      queryKey: courseKeys.list(filters),
      queryFn: () => fetchCourseList(filters),
    }),
  study: (courseId: string) =>
    queryOptions({
      queryKey: courseKeys.study(courseId),
      queryFn: () => fetchCourseStudy(courseId),
      enabled: Boolean(courseId),
    }),
};
