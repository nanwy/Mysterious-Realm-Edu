import assert from "node:assert/strict";
import test from "node:test";
import {
  getStudentProfile,
  STUDENT_PROFILE_CONFIG_ERROR,
} from "./student-profile.ts";

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

test("getStudentProfile returns normalized profile payload when all user APIs succeed", async () => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://example.com";

  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);

    if (url.endsWith("/user/queryUserInfo")) {
      return createJsonResponse(
        createEnvelope({
          userId: 7,
          realName: "Alice",
        })
      );
    }

    if (url.endsWith("/user/getCurrentDept")) {
      return createJsonResponse(
        createEnvelope({
          deptId: "d-1",
          deptName: "研发中心",
        })
      );
    }

    if (url.endsWith("/user/getCurrentUserDeparts")) {
      return createJsonResponse(
        createEnvelope([
          {
            deptId: "d-1",
            deptName: "研发中心",
          },
          {
            deptId: "d-2",
            deptName: "教务部",
          },
        ])
      );
    }

    throw new Error(`Unexpected URL: ${url}`);
  }) as typeof fetch;

  const result = await getStudentProfile();

  assert.deepEqual(result, {
    profile: {
      userId: 7,
      realName: "Alice",
    },
    currentDept: {
      deptId: "d-1",
      deptName: "研发中心",
    },
    departs: [
      {
        deptId: "d-1",
        deptName: "研发中心",
      },
      {
        deptId: "d-2",
        deptName: "教务部",
      },
    ],
    error: null,
    errorType: null,
  });
});

test("getStudentProfile returns explicit config error when NEXT_PUBLIC_API_BASE_URL is missing", async () => {
  delete process.env.NEXT_PUBLIC_API_BASE_URL;

  let fetchCalled = false;
  globalThis.fetch = (async () => {
    fetchCalled = true;
    throw new Error("fetch should not be called without base url");
  }) as typeof fetch;

  const result = await getStudentProfile();

  assert.equal(fetchCalled, false);
  assert.deepEqual(result, {
    profile: null,
    currentDept: null,
    departs: [],
    error: STUDENT_PROFILE_CONFIG_ERROR,
    errorType: "config_missing",
  });
});

test("getStudentProfile marks unauthorized failures without throwing away successful payloads", async () => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://example.com";

  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);

    if (url.endsWith("/user/queryUserInfo")) {
      return createJsonResponse(
        createEnvelope({
          userId: 7,
          realName: "Alice",
        })
      );
    }

    if (url.endsWith("/user/getCurrentDept")) {
      return createJsonResponse(
        {
          code: 401,
          message: "未登录",
        },
        200
      );
    }

    if (url.endsWith("/user/getCurrentUserDeparts")) {
      return createJsonResponse(
        createEnvelope([
          {
            deptId: "d-1",
            deptName: "研发中心",
          },
        ])
      );
    }

    throw new Error(`Unexpected URL: ${url}`);
  }) as typeof fetch;

  const result = await getStudentProfile();

  assert.equal(result.profile?.realName, "Alice");
  assert.equal(result.currentDept, null);
  assert.deepEqual(result.departs, [
    {
      deptId: "d-1",
      deptName: "研发中心",
    },
  ]);
  assert.equal(result.errorType, "unauthorized");
  assert.match(result.error ?? "", /当前部门/);
  assert.match(result.error ?? "", /未登录/);
});

test("getStudentProfile marks network and service failures as request_failed", async () => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://example.com";

  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);

    if (url.endsWith("/user/queryUserInfo")) {
      throw new TypeError("fetch failed");
    }

    if (url.endsWith("/user/getCurrentDept")) {
      return createJsonResponse(
        createEnvelope({
          deptId: "d-1",
          deptName: "研发中心",
        })
      );
    }

    if (url.endsWith("/user/getCurrentUserDeparts")) {
      throw Object.assign(new Error("服务异常"), {
        code: 500,
        status: 500,
      });
    }

    throw new Error(`Unexpected URL: ${url}`);
  }) as typeof fetch;

  const result = await getStudentProfile();

  assert.equal(result.profile, null);
  assert.deepEqual(result.currentDept, {
    deptId: "d-1",
    deptName: "研发中心",
  });
  assert.deepEqual(result.departs, []);
  assert.equal(result.errorType, "request_failed");
  assert.match(result.error ?? "", /用户信息/);
  assert.match(result.error ?? "", /部门列表/);
});
