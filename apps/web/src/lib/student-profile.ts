import { unwrapEnvelope } from "@workspace/api/client";
import {
  getCurrentDept,
  getCurrentUserDeparts,
  queryUserInfo,
} from "@workspace/api/modules/user";

export const STUDENT_PROFILE_CONFIG_ERROR =
  "未配置 NEXT_PUBLIC_API_BASE_URL，当前属于环境问题，不是页面渲染问题。";

export type StudentProfileErrorType =
  | "config_missing"
  | "unauthorized"
  | "request_failed"
  | null;

export interface StudentProfileResult {
  profile: Record<string, unknown> | null;
  currentDept: Record<string, unknown> | null;
  departs: Array<Record<string, unknown>>;
  error: string | null;
  errorType: StudentProfileErrorType;
}

interface RequestOutcome<T> {
  data: T | null;
  error: string | null;
  errorType: Exclude<StudentProfileErrorType, "config_missing" | null> | null;
}

function toRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toRecordList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === "object" && !Array.isArray(item)
  );
}

function getBaseUrl() {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL;
  return typeof value === "string" ? value.trim() : "";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : "接口请求失败";
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
): StudentProfileErrorType {
  if (outcomes.some((item) => item.errorType === "unauthorized")) {
    return "unauthorized";
  }

  if (outcomes.some((item) => item.errorType === "request_failed")) {
    return "request_failed";
  }

  return null;
}

export async function getStudentProfile(): Promise<StudentProfileResult> {
  if (!getBaseUrl()) {
    return {
      profile: null,
      currentDept: null,
      departs: [],
      error: STUDENT_PROFILE_CONFIG_ERROR,
      errorType: "config_missing",
    };
  }

  const [profileResult, currentDeptResult, departsResult] = await Promise.all([
    safeRequest("用户信息", () => queryUserInfo()),
    safeRequest("当前部门", () => getCurrentDept()),
    safeRequest("部门列表", () => getCurrentUserDeparts()),
  ]);

  const errors = [profileResult.error, currentDeptResult.error, departsResult.error].filter(
    (value): value is string => Boolean(value)
  );

  return {
    profile: toRecord(profileResult.data),
    currentDept: toRecord(currentDeptResult.data),
    departs: toRecordList(departsResult.data),
    error: errors.length > 0 ? errors.join("；") : null,
    errorType: combineErrorType([profileResult, currentDeptResult, departsResult]),
  };
}
