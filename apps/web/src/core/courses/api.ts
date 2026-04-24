import {
  getCourseList,
  getCourseStudyDetail,
  getCourseStudyProcess,
  getLatestStudyTask,
  unwrapEnvelope,
} from "@workspace/api";
import {
  COURSE_CATEGORY_PLACEHOLDER,
  COURSE_STUDY_CONFIG_ERROR,
  COURSE_TYPE_STUDENT,
} from "./config";
import type {
  CourseCategoryOption,
  CourseFiltersState,
  CourseListItem,
  CourseListResult,
  CourseStudyErrorType,
  CourseStudyResult,
} from "./types";
import {
  toNumberOrNull,
  toRecord,
  toRecordOrEmpty,
  toText,
} from "@/lib/normalize";

interface ListPayloadShape {
  records?: unknown[];
  list?: unknown[];
  rows?: unknown[];
  total?: number;
}

const formatPrice = (value: unknown) => {
  const amount = toNumberOrNull(value);
  if (amount === null) {
    return "价格待更新";
  }

  if (amount <= 0) {
    return "免费学习";
  }

  return `¥${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
};

const formatProgress = (value: unknown) => {
  const progress = toNumberOrNull(value);
  if (progress === null) {
    return "进度待同步";
  }

  const normalized = Math.min(100, Math.max(0, Math.round(progress)));
  return `已学 ${normalized}%`;
};

const formatLessonCount = (value: unknown) => {
  const count = toNumberOrNull(value);
  return count && count > 0 ? `${count} 节内容` : "课时待补充";
};

const formatStatus = (record: Record<string, unknown>) => {
  const numericProgress = toNumberOrNull(record.studyProcess);
  return (
    toText(record.studyStatusName) ||
    toText(record.statusText) ||
    toText(record.learnStatus) ||
    (numericProgress && numericProgress > 0 ? "学习中" : "可开始")
  );
};

const toCourseListItem = (value: unknown, index: number): CourseListItem => {
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
    toText(record.teacherName) ||
    toText(record.lecturerName) ||
    toText(record.authorName) ||
    "讲师待补充";

  const categoryName =
    toText(record.categoryName) ||
    toText(record.categoryTitle) ||
    toText(record.courseCategoryName) ||
    "未分类";

  return {
    id: String(id),
    title,
    teacherName,
    categoryName,
    priceLabel: formatPrice(record.price ?? record.salePrice ?? record.amount),
    statusLabel: formatStatus(record),
    progressLabel: formatProgress(
      record.studyProcess ?? record.progress ?? record.schedule
    ),
    lessonCountLabel: formatLessonCount(
      record.lessonNum ?? record.classHour ?? record.periods
    ),
    coverLabel: title.slice(0, 2).toUpperCase(),
  };
};

const toListArray = (payload: unknown) => {
  const record = toRecordOrEmpty(payload) as ListPayloadShape;

  if (Array.isArray(record.records)) {
    return record.records;
  }

  if (Array.isArray(record.list)) {
    return record.list;
  }

  if (Array.isArray(record.rows)) {
    return record.rows;
  }

  return [];
};

const toListTotal = (payload: unknown, fallback: number) => {
  const record = toRecordOrEmpty(payload) as ListPayloadShape;
  return typeof record.total === "number" && Number.isFinite(record.total)
    ? record.total
    : fallback;
};

const buildCategoryOptions = (
  items: CourseListItem[],
  selectedCategoryId: string
): CourseCategoryOption[] => {
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
    .map((label): CourseCategoryOption => ({ value: label, label }));

  const options: CourseCategoryOption[] = [
    { value: "", label: "全部分类" },
    ...dynamic,
  ];

  if (
    selectedCategoryId &&
    !options.some((item) => item.value === selectedCategoryId)
  ) {
    options.push({ value: selectedCategoryId, label: selectedCategoryId });
  }

  if (options.length === 1) {
    options.push({
      value: COURSE_CATEGORY_PLACEHOLDER,
      label: "分类待接口补充",
    });
  }

  return options;
};

export const normalizeCourseError = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "课程接口暂不可用，请确认已登录且 NEXT_PUBLIC_API_BASE_URL 已配置。";
};

export const fetchCourseList = async (
  filters: CourseFiltersState
): Promise<CourseListResult> => {
  const response = await getCourseList({
    pageNo: filters.pageNo,
    pageSize: filters.pageSize,
    name: filters.keyword,
    orderByType: filters.orderBy,
    categoryId:
      filters.categoryId === COURSE_CATEGORY_PLACEHOLDER ? "" : filters.categoryId,
    courseType: COURSE_TYPE_STUDENT,
  });

  const payload = unwrapEnvelope(response);
  const records = toListArray(payload);
  const items = records.map(toCourseListItem);

  return {
    items,
    total: toListTotal(payload, items.length),
    categories: buildCategoryOptions(items, filters.categoryId),
  };
};

const getBaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL;
  return typeof value === "string" ? value.trim() : "";
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error && error.message ? error.message : "接口请求失败";

const isUnauthorizedError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: unknown; status?: unknown };
  return (
    candidate.code === 401 ||
    candidate.code === 403 ||
    candidate.status === 401 ||
    candidate.status === 403
  );
};

type StudyFailureType = Exclude<CourseStudyErrorType, "config_missing" | null>;

interface StudyRequestOutcome<T> {
  data: T | null;
  error: string | null;
  errorType: StudyFailureType | null;
}

type StudyEnvelopeLoader<T> = () => Promise<{
  code: number;
  message: string;
  result?: T;
  data?: T;
}>;

const safeStudyRequest = async <T>(
  label: string,
  loader: StudyEnvelopeLoader<T>
): Promise<StudyRequestOutcome<T>> => {
  try {
    return {
      data: (unwrapEnvelope(await loader()) as T | null),
      error: null,
      errorType: null,
    };
  } catch (error) {
    return {
      data: null,
      error: `${label}读取失败：${getErrorMessage(error)}`,
      errorType: isUnauthorizedError(error) ? "unauthorized" : "request_failed",
    };
  }
};

const combineStudyErrorType = (
  outcomes: Array<StudyRequestOutcome<unknown>>
): CourseStudyErrorType => {
  if (outcomes.some((item) => item.errorType === "unauthorized")) {
    return "unauthorized";
  }

  if (outcomes.some((item) => item.errorType === "request_failed")) {
    return "request_failed";
  }

  return null;
};

export const fetchCourseStudy = async (
  courseId: string | number
): Promise<CourseStudyResult> => {
  if (!getBaseUrl()) {
    return {
      detail: null,
      process: null,
      latestTask: null,
      error: COURSE_STUDY_CONFIG_ERROR,
      errorType: "config_missing",
    };
  }

  const [detailResult, processResult, latestTaskResult] = await Promise.all([
    safeStudyRequest("课程学习详情", () => getCourseStudyDetail(courseId)),
    safeStudyRequest("学习进度", () => getCourseStudyProcess(courseId)),
    safeStudyRequest("最近学习任务", () => getLatestStudyTask(courseId)),
  ]);

  const errors = [
    detailResult.error,
    processResult.error,
    latestTaskResult.error,
  ].filter((value): value is string => Boolean(value));

  return {
    detail: toRecord(detailResult.data),
    process: toRecord(processResult.data),
    latestTask: toRecord(latestTaskResult.data),
    error: errors.length > 0 ? errors.join("；") : null,
    errorType: combineStudyErrorType([
      detailResult,
      processResult,
      latestTaskResult,
    ]),
  };
};
