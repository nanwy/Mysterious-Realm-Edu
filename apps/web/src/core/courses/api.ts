import { api, unwrapEnvelope } from "@workspace/api";
import type {
  CourseCategoryDetail,
  CourseLatestStudyTaskResponse,
  CourseListResponse,
  CourseStudyDetailResponse,
  CourseStudyProcessResponse,
} from "@workspace/api";
import {
  COURSE_CATEGORY_PLACEHOLDER,
  COURSE_STUDY_CONFIG_ERROR,
  COURSE_TYPE_STUDENT,
} from "./config";
import type { CourseFiltersState } from "./types";

const buildCategoryOptions = (
  courses: CourseListResponse["records"],
  selectedCategoryId: string
): CourseCategoryDetail[] => {
  const seen = new Set<string>();
  const dynamic = courses
    .map((course) => course.categoryName?.trim())
    .filter((name): name is string => {
      if (!name || seen.has(name)) {
        return false;
      }

      seen.add(name);
      return true;
    })
    .map((name): CourseCategoryDetail => ({ id: name, name }));

  const options: CourseCategoryDetail[] = [
    { id: "", name: "全部分类" },
    ...dynamic,
  ];

  if (
    selectedCategoryId &&
    !options.some((item) => item.id === selectedCategoryId)
  ) {
    options.push({ id: selectedCategoryId, name: selectedCategoryId });
  }

  if (options.length === 1) {
    options.push({
      id: COURSE_CATEGORY_PLACEHOLDER,
      name: "分类待接口补充",
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

export const fetchCourseList = async (filters: CourseFiltersState) => {
  const response = await api.course.listCourses({
    pageNo: filters.pageNo,
    pageSize: filters.pageSize,
    name: filters.keyword,
    orderByType: filters.orderBy,
    categoryId:
      filters.categoryId === COURSE_CATEGORY_PLACEHOLDER ? "" : filters.categoryId,
    courseType: COURSE_TYPE_STUDENT,
  });

  const payload = unwrapEnvelope(response) as CourseListResponse | null;
  const records = payload?.records ?? [];

  return {
    records,
    total: payload?.total ?? records.length,
    categories: buildCategoryOptions(records, filters.categoryId),
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

type CourseStudyErrorType =
  | "config_missing"
  | "unauthorized"
  | "request_failed"
  | null;
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

export const fetchCourseStudy = async (courseId: string | number) => {
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
    safeStudyRequest<CourseStudyDetailResponse>("课程学习详情", () =>
      api.course.getCourseStudyDetail({ courseId })
    ),
    safeStudyRequest<CourseStudyProcessResponse>("学习进度", () =>
      api.course.getCourseStudyProcess({ courseId })
    ),
    safeStudyRequest<CourseLatestStudyTaskResponse>("最近学习任务", () =>
      api.course.getLatestStudyTask({ courseId })
    ),
  ]);

  const errors = [
    detailResult.error,
    processResult.error,
    latestTaskResult.error,
  ].filter((value): value is string => Boolean(value));

  return {
    detail: detailResult.data,
    process: processResult.data,
    latestTask: latestTaskResult.data,
    error: errors.length > 0 ? errors.join("；") : null,
    errorType: combineStudyErrorType([
      detailResult,
      processResult,
      latestTaskResult,
    ]),
  };
};
