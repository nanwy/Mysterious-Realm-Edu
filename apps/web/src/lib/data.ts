import { api, unwrapEnvelope } from "@workspace/api";

function toArray(value: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(value)) {
    return value as Array<Record<string, unknown>>;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.records))
      return record.records as Array<Record<string, unknown>>;
    if (Array.isArray(record.list))
      return record.list as Array<Record<string, unknown>>;
    if (Array.isArray(record.rows))
      return record.rows as Array<Record<string, unknown>>;
    if (Array.isArray(record.data))
      return record.data as Array<Record<string, unknown>>;
  }

  return [];
}

async function safeArrayRequest(
  factory: () => Promise<{
    code: number;
    message: string;
    result?: unknown;
    data?: unknown;
  }>
) {
  try {
    const response = await factory();
    return {
      items: toArray(unwrapEnvelope(response)),
      error: null as string | null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "接口请求失败";
    return {
      items: [] as Array<Record<string, unknown>>,
      error: message,
    };
  }
}

export async function getCoursePageData() {
  return safeArrayRequest(() =>
    api.course.listCourses({
      pageNo: 1,
      pageSize: 8,
    })
  );
}

export async function getPracticePageData() {
  return safeArrayRequest(() =>
    api.practice.listRepositories({
      pageNo: 1,
      pageSize: 8,
    })
  );
}

export async function getExamPageData() {
  return safeArrayRequest(() =>
    api.exam.listExams({
      pageNo: 1,
      pageSize: 8,
    })
  );
}
