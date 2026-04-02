import assert from "node:assert/strict";
import test from "node:test";
import {
  COURSE_STUDY_CONFIG_ERROR,
  getCourseStudy,
} from "./course-study.ts";

const ORIGINAL_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ORIGINAL_FETCH = globalThis.fetch;

function createEnvelope<T>(data: T) {
  return {
    code: 200,
    message: "ok",
    result: data,
  };
}

function createJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

test.afterEach(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = ORIGINAL_BASE_URL;
  globalThis.fetch = ORIGINAL_FETCH;
});

test("getCourseStudy returns explicit config error when NEXT_PUBLIC_API_BASE_URL is missing", async () => {
  delete process.env.NEXT_PUBLIC_API_BASE_URL;

  let fetchCalled = false;
  globalThis.fetch = (async () => {
    fetchCalled = true;
    throw new Error("fetch should not be called without base url");
  }) as typeof fetch;

  const result = await getCourseStudy("course-1");

  assert.equal(fetchCalled, false);
  assert.deepEqual(result, {
    detail: null,
    process: null,
    latestTask: null,
    error: COURSE_STUDY_CONFIG_ERROR,
    errorType: "config_missing",
  });
});

test("getCourseStudy returns normalized payload when all course study APIs succeed", async () => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://example.com";

  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);

    if (url.endsWith("/course/getCourseStudyDetail?id=course-1")) {
      return createJsonResponse(
        createEnvelope({
          id: "course-1",
          courseName: "Mystic Algebra",
          chapterTotal: 12,
        })
      );
    }

    if (url.endsWith("/course/getCourseStudyProcess?courseId=course-1")) {
      return createJsonResponse(
        createEnvelope({
          studyProcess: 67,
          studyStatusName: "学习中",
        })
      );
    }

    if (url.endsWith("/course/latestStudyTask?courseId=course-1")) {
      return createJsonResponse(
        createEnvelope({
          id: "task-9",
          taskName: "第九节",
        })
      );
    }

    throw new Error(`Unexpected URL: ${url}`);
  }) as typeof fetch;

  const result = await getCourseStudy("course-1");

  assert.deepEqual(result, {
    detail: {
      id: "course-1",
      courseName: "Mystic Algebra",
      chapterTotal: 12,
    },
    process: {
      studyProcess: 67,
      studyStatusName: "学习中",
    },
    latestTask: {
      id: "task-9",
      taskName: "第九节",
    },
    error: null,
    errorType: null,
  });
});

test("getCourseStudy marks unauthorized failures without throwing away successful payloads", async () => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://example.com";

  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);

    if (url.endsWith("/course/getCourseStudyDetail?id=course-1")) {
      return createJsonResponse(
        createEnvelope({
          id: "course-1",
          courseName: "Mystic Algebra",
        })
      );
    }

    if (url.endsWith("/course/getCourseStudyProcess?courseId=course-1")) {
      return createJsonResponse({
        code: 401,
        message: "未登录",
      });
    }

    if (url.endsWith("/course/latestStudyTask?courseId=course-1")) {
      return createJsonResponse(
        createEnvelope({
          id: "task-9",
          taskName: "第九节",
        })
      );
    }

    throw new Error(`Unexpected URL: ${url}`);
  }) as typeof fetch;

  const result = await getCourseStudy("course-1");

  assert.equal(result.detail?.courseName, "Mystic Algebra");
  assert.equal(result.process, null);
  assert.deepEqual(result.latestTask, {
    id: "task-9",
    taskName: "第九节",
  });
  assert.equal(result.errorType, "unauthorized");
  assert.match(result.error ?? "", /学习进度/);
  assert.match(result.error ?? "", /未登录/);
});

test("getCourseStudy marks request failures and normalizes invalid payloads", async () => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://example.com";

  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);

    if (url.endsWith("/course/getCourseStudyDetail?id=course-1")) {
      throw new TypeError("fetch failed");
    }

    if (url.endsWith("/course/getCourseStudyProcess?courseId=course-1")) {
      return createJsonResponse(
        createEnvelope("invalid-object")
      );
    }

    if (url.endsWith("/course/latestStudyTask?courseId=course-1")) {
      return createJsonResponse(
        createEnvelope(["invalid-array"])
      );
    }

    throw new Error(`Unexpected URL: ${url}`);
  }) as typeof fetch;

  const result = await getCourseStudy("course-1");

  assert.equal(result.detail, null);
  assert.equal(result.process, null);
  assert.equal(result.latestTask, null);
  assert.equal(result.errorType, "request_failed");
  assert.match(result.error ?? "", /课程学习详情/);
  assert.match(result.error ?? "", /fetch failed/);
});
