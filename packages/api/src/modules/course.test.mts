import assert from "node:assert/strict";
import test from "node:test";
import { createCourseApi } from "./course.ts";
import type { ApiHttpClient } from "../client.ts";
import type { ApiEnvelope } from "../types";

const ok = <T>(): ApiEnvelope<T> => ({
  code: 200,
  message: "ok",
  result: null as T,
});

const createMockClient = () => {
  const calls: unknown[] = [];
  const client: ApiHttpClient = {
    get: async (path, init) => {
      calls.push({ method: "GET", path, init });
      return ok();
    },
    post: async (path, body, init) => {
      calls.push({ method: "POST", path, body, init });
      return ok();
    },
  };
  return { client, calls };
};

test("course api posts course list payload", async () => {
  const { client, calls } = createMockClient();
  const api = createCourseApi(client);

  await api.listCourses({ pageNo: 1, pageSize: 12 });

  assert.deepEqual(calls[0], {
    method: "POST",
    path: "/course/list",
    body: { pageNo: 1, pageSize: 12 },
    init: undefined,
  });
});

test("course api sends detail id as query object", async () => {
  const { client, calls } = createMockClient();
  const api = createCourseApi(client);

  await api.getCourseDetail({ courseId: "c1" });

  assert.deepEqual(calls[0], {
    method: "GET",
    path: "/course/getCourseDetail",
    init: { query: { courseId: "c1" } },
  });
});
