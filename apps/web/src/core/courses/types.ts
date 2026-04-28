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
