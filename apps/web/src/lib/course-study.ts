import { toRecord } from "@/lib/normalize";
import {
  getCourseStudyDetail,
  getLatestStudyTask,
  getCourseStudyProcess,
} from "@workspace/api";

export const COURSE_STUDY_CONFIG_ERROR =
  "未配置 NEXT_PUBLIC_API_BASE_URL，当前属于环境问题，不是课程学习页面本身的问题。";

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

interface RequestOutcome<T> {
  data: T | null;
  error: string | null;
  errorType: Exclude<CourseStudyErrorType, "config_missing" | null> | null;
}

interface ApiEnvelope<T> {
  code: number;
  message: string;
  result?: T;
  data?: T;
}

function getBaseUrl() {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL;
  return typeof value === "string" ? value.trim() : "";
}

function unwrapEnvelope<T>(payload: ApiEnvelope<T>) {
  return payload.result ?? payload.data ?? null;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "接口请求失败";
}

function isUnauthorizedError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    code?: unknown;
    status?: unknown;
  };

  return (
    candidate.code === 401 ||
    candidate.code === 403 ||
    candidate.status === 401 ||
    candidate.status === 403
  );
}

async function safeRequest<T>(
  label: string,
  loader: () => Promise<{ code: number; message: string; result?: T; data?: T }>
): Promise<RequestOutcome<T>> {
  try {
    return {
      data: unwrapEnvelope(await loader()) as T | null,
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
}

function combineErrorType(
  outcomes: Array<RequestOutcome<unknown>>
): CourseStudyErrorType {
  if (outcomes.some((item) => item.errorType === "unauthorized")) {
    return "unauthorized";
  }

  if (outcomes.some((item) => item.errorType === "request_failed")) {
    return "request_failed";
  }

  return null;
}

export async function getCourseStudy(
  courseId: string | number
): Promise<CourseStudyResult> {
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
    safeRequest("课程学习详情", () => getCourseStudyDetail(courseId)),
    safeRequest("学习进度", () => getCourseStudyProcess(courseId)),
    safeRequest("最近学习任务", () => getLatestStudyTask(courseId)),
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
    errorType: combineErrorType([
      detailResult,
      processResult,
      latestTaskResult,
    ]),
  };
}
