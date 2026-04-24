"use client";

import { createApiClient, unwrapEnvelope } from "@workspace/api";
import {
  COURSE_PAGE_SIZE,
  type CourseCategoryOption,
  type CourseListItem,
  type CourseListResult,
  type CourseQueryState,
} from "./courses-types";
import { toNumberOrNull, toRecordOrEmpty, toText } from "@/lib/normalize";

interface CourseListPayload {
  records?: unknown[];
  total?: number;
  list?: unknown[];
  rows?: unknown[];
}

const client = createApiClient({
  getToken: () => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("token");
  },
});

function formatPrice(value: unknown) {
  const amount = toNumberOrNull(value);
  if (amount === null) {
    return "价格待更新";
  }

  if (amount <= 0) {
    return "免费学习";
  }

  return `¥${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
}

function formatProgress(value: unknown) {
  const progress = toNumberOrNull(value);
  if (progress === null) {
    return "进度待同步";
  }

  const normalized = Math.min(100, Math.max(0, Math.round(progress)));
  return `已学 ${normalized}%`;
}

function formatLessonCount(value: unknown) {
  const count = toNumberOrNull(value);
  return count && count > 0 ? `${count} 节内容` : "课时待补充";
}

function formatStatus(record: Record<string, unknown>) {
  return (
    toText(record.studyStatusName) ||
    toText(record.statusText) ||
    toText(record.learnStatus) ||
    (toNumberOrNull(record.studyProcess) && Number(record.studyProcess) > 0 ? "学习中" : "可开始")
  );
}

function normalizeCourseItem(value: unknown, index: number): CourseListItem {
  const record = toRecordOrEmpty(value);
  const id =
    record.id ??
    record.courseId ??
    record.goodsId ??
    record.productId ??
    `course-${index + 1}`;

  const title =
    toText(record.courseName) ||
    toText(record.title) ||
    toText(record.goodsName) ||
    `课程 ${index + 1}`;

  const teacherName =
    toText(record.teacherName) || toText(record.lecturerName) || toText(record.authorName) || "讲师待补充";

  const categoryName =
    toText(record.categoryName) || toText(record.categoryTitle) || toText(record.courseCategoryName) || "未分类";

  return {
    id: String(id),
    title,
    teacherName,
    categoryName,
    priceLabel: formatPrice(record.price ?? record.salePrice ?? record.amount),
    statusLabel: formatStatus(record),
    progressLabel: formatProgress(record.studyProcess ?? record.progress ?? record.schedule),
    lessonCountLabel: formatLessonCount(record.lessonNum ?? record.classHour ?? record.periods),
    coverLabel: title.slice(0, 2).toUpperCase(),
  };
}

function getCourseArray(payload: unknown) {
  const result = toRecordOrEmpty(payload) as CourseListPayload;

  if (Array.isArray(result.records)) {
    return result.records;
  }

  if (Array.isArray(result.list)) {
    return result.list;
  }

  if (Array.isArray(result.rows)) {
    return result.rows;
  }

  return [];
}

function getCourseTotal(payload: unknown, count: number) {
  const result = toRecordOrEmpty(payload) as CourseListPayload;
  return typeof result.total === "number" && Number.isFinite(result.total) ? result.total : count;
}

function collectCategories(items: CourseListItem[], selectedCategoryId: string) {
  const seen = new Set<string>();
  const dynamic = items
    .map((item) => item.categoryName)
    .filter((label) => {
      if (!label || seen.has(label)) {
        return false;
      }

      seen.add(label);
      return true;
    })
    .map((label) => ({ value: label, label } satisfies CourseCategoryOption));

  const options: CourseCategoryOption[] = [
    { value: "", label: "全部分类" },
    ...dynamic,
  ];

  if (selectedCategoryId && !options.some((item) => item.value === selectedCategoryId)) {
    options.push({ value: selectedCategoryId, label: selectedCategoryId });
  }

  if (options.length === 1) {
    options.push({ value: "placeholder", label: "分类待接口补充" });
  }

  return options;
}

export function normalizeCourseError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "课程接口暂不可用，请确认已登录且 NEXT_PUBLIC_API_BASE_URL 已配置。";
}

export async function fetchCourses(query: CourseQueryState): Promise<CourseListResult> {
  const response = await client.post<CourseListPayload>("/course/list", {
    pageNo: query.page,
    pageSize: COURSE_PAGE_SIZE,
    name: query.keyword,
    orderByType: query.orderByType,
    categoryId: query.categoryId === "placeholder" ? "" : query.categoryId,
    courseType: "2",
  });

  const payload = unwrapEnvelope(response);
  const records = getCourseArray(payload);
  const items = records.map(normalizeCourseItem);

  return {
    items,
    total: getCourseTotal(payload, items.length),
    categories: collectCategories(items, query.categoryId as string),
  };
}
