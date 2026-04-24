export const COURSES_PAGE_SIZE = 9;

export enum COURSE_ORDER_BY {
  DEFAULT = "",
  LATEST = "1",
  HOT = "2",
  PRICE = "3",
}

export type CourseOrderBy = COURSE_ORDER_BY;

export const COURSE_ORDER_BY_OPTIONS = [
  { value: COURSE_ORDER_BY.DEFAULT, label: "综合排序" },
  { value: COURSE_ORDER_BY.LATEST, label: "最新上架" },
  { value: COURSE_ORDER_BY.HOT, label: "学习热度" },
  { value: COURSE_ORDER_BY.PRICE, label: "价格优先" },
] as const;

export const COURSE_TYPE_STUDENT = "2";

export const COURSE_CATEGORY_PLACEHOLDER = "placeholder";

export const COURSE_STUDY_CONFIG_ERROR =
  "未配置 NEXT_PUBLIC_API_BASE_URL，当前属于环境问题，不是课程学习页面本身的问题。";
