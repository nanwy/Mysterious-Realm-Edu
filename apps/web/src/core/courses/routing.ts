import {
  COURSE_ORDER_BY,
  COURSES_PAGE_SIZE,
  type CourseOrderBy,
} from "./config";
import type { CourseFiltersState } from "./types";

type SearchParamValue = string | string[] | undefined;
type CourseSearchParams = Record<string, SearchParamValue>;

const readSingleParam = (value: SearchParamValue) =>
  Array.isArray(value) ? value[0] : value;

const readPositivePage = (value: SearchParamValue) => {
  const page = Number(readSingleParam(value));
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
};

const readKeyword = (value: SearchParamValue) => {
  const raw = readSingleParam(value);
  return typeof raw === "string" ? raw.trim() : "";
};

const readCourseOrderBy = (value: SearchParamValue): CourseOrderBy => {
  const raw = readSingleParam(value);
  if (
    raw === COURSE_ORDER_BY.LATEST ||
    raw === COURSE_ORDER_BY.COMMENTS ||
    raw === COURSE_ORDER_BY.COLLECTS ||
    raw === COURSE_ORDER_BY.LEARNERS
  ) {
    return raw;
  }

  return COURSE_ORDER_BY.DEFAULT;
};

export const buildCourseFiltersFromSearchParams = (
  params: CourseSearchParams
): CourseFiltersState => ({
  keyword: readKeyword(params.keyword),
  orderBy: readCourseOrderBy(params.sort),
  categoryId: readKeyword(params.category),
  pageNo: readPositivePage(params.page),
  pageSize: COURSES_PAGE_SIZE,
});

export const buildCourseQueryString = (filters: CourseFiltersState) => {
  const params = new URLSearchParams();

  if (filters.pageNo > 1) {
    params.set("page", String(filters.pageNo));
  }

  if (filters.keyword) {
    params.set("keyword", filters.keyword);
  }

  if (filters.orderBy !== COURSE_ORDER_BY.DEFAULT) {
    params.set("sort", filters.orderBy);
  }

  if (filters.categoryId) {
    params.set("category", filters.categoryId);
  }

  const result = params.toString();
  return result ? `?${result}` : "";
};
