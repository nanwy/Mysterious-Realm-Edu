import type { CourseOrderBy } from "./config";

export interface CourseFiltersState {
  keyword: string;
  orderBy: CourseOrderBy;
  categoryId: string;
  pageNo: number;
  pageSize: number;
}

export interface CourseFormValues {
  page: number;
  keyword: string;
  orderBy: CourseOrderBy;
  categoryId: string;
}

export interface CourseCategoryOption {
  value: string;
  label: string;
}

export interface CourseListItem {
  id: string;
  title: string;
  teacherName: string;
  categoryName: string;
  priceLabel: string;
  statusLabel: string;
  progressLabel: string;
  lessonCountLabel: string;
  coverLabel: string;
}

export interface CourseListResult {
  items: CourseListItem[];
  total: number;
  categories: CourseCategoryOption[];
}

export type CourseStudyErrorType =
  | "config_missing"
  | "unauthorized"
  | "request_failed"
  | null;

export interface CourseStudyResult {
  detail: Record<string, unknown> | null;
  process: Record<string, unknown> | null;
  latestTask: Record<string, unknown> | null;
  error: string | null;
  errorType: CourseStudyErrorType;
}
