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

interface CourseApiModule {
  getCourseStudyDetail: (courseId: string | number) => Promise<ApiEnvelope<unknown>>;
  getCourseStudyProcess: (courseId: string | number) => Promise<ApiEnvelope<unknown>>;
  getLatestStudyTask: (courseId: string | number) => Promise<ApiEnvelope<unknown>>;
}

let courseApiModulePromise: Promise<CourseApiModule> | null = null;

function toRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function getBaseUrl() {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL;
  return typeof value === "string" ? value.trim() : "";
}

function unwrapEnvelope<T>(payload: ApiEnvelope<T>) {
  return payload.result ?? payload.data ?? null;
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

async function loadCourseApiModule(): Promise<CourseApiModule> {
  if (!courseApiModulePromise) {
    courseApiModulePromise = (async () => {
      try {
        const module = await import("@workspace/api");

        return {
          getCourseStudyDetail: module.getCourseStudyDetail,
          getCourseStudyProcess: module.getCourseStudyProcess,
          getLatestStudyTask: module.getLatestStudyTask,
        };
      } catch (error) {
        if (!(error instanceof Error) || error.name !== "Error" && !error.message.includes("ERR_MODULE_NOT_FOUND")) {
          throw error;
        }

        const [{ readFile }, moduleTools] = await Promise.all([
          import("node:fs/promises"),
          import("node:module"),
        ]);

        const sourceUrl = new URL("../../../../packages/api/src/modules/course.ts", import.meta.url);
        const clientUrl = new URL("../../../../packages/api/src/client.ts", import.meta.url);
        const source = await readFile(sourceUrl, "utf8");
        const normalizedSource = source.replace(
          'from "../client"',
          `from "${clientUrl.href}"`
        );
        const runtimeCode = moduleTools.stripTypeScriptTypes(normalizedSource);
        const runtimeModule = await import(
          `data:text/javascript;base64,${Buffer.from(runtimeCode).toString("base64")}`
        );

        return {
          getCourseStudyDetail: runtimeModule.getCourseStudyDetail,
          getCourseStudyProcess: runtimeModule.getCourseStudyProcess,
          getLatestStudyTask: runtimeModule.getLatestStudyTask,
        } satisfies CourseApiModule;
      }
    })();
  }

  return courseApiModulePromise;
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

  const courseApi = await loadCourseApiModule();

  const [detailResult, processResult, latestTaskResult] = await Promise.all([
    safeRequest("课程学习详情", () => courseApi.getCourseStudyDetail(courseId)),
    safeRequest("学习进度", () => courseApi.getCourseStudyProcess(courseId)),
    safeRequest("最近学习任务", () => courseApi.getLatestStudyTask(courseId)),
  ]);

  const errors = [detailResult.error, processResult.error, latestTaskResult.error].filter(
    (value): value is string => Boolean(value)
  );

  return {
    detail: toRecord(detailResult.data),
    process: toRecord(processResult.data),
    latestTask: toRecord(latestTaskResult.data),
    error: errors.length > 0 ? errors.join("；") : null,
    errorType: combineErrorType([detailResult, processResult, latestTaskResult]),
  };
}
