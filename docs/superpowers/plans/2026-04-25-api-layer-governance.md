# API Layer Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Web app API access layer into a consistent headless `packages/api` SDK with namespaced domain modules, while keeping Web domain normalization in `apps/web/src/core`.

**Architecture:** `packages/api` owns HTTP transport, endpoint paths, request DTOs, raw response DTOs, and compatibility exports. `apps/web/src/core/<domain>` owns envelope unwrapping, legacy backend normalization, React Query queryOptions, mutations, and page-facing domain models. The first implementation slice covers shared API utilities plus `course` and `exam`, because those are current reference domains.

**Tech Stack:** TypeScript ESM, Next.js App Router, TanStack Query v5, Node test runner via `tsx --test`, pnpm workspaces.

---

## File Map

- Modify `packages/api/package.json`
  - Add package-local `test` and `typecheck` scripts.
  - Export stable subpaths for `client`, `types`, and modules as needed.

- Modify `packages/api/tsconfig.json`
  - Keep package strict TypeScript coverage for `src/**/*`.

- Modify `packages/api/src/client.ts`
  - Keep `createApiClient`.
  - Add an explicit `ApiHttpClient` interface.
  - Support `get(path, { query })` so modules do not hand-build query strings.
  - Re-export low-level helpers from their new files.

- Create `packages/api/src/errors.ts`
  - Own `ApiError`.

- Create `packages/api/src/endpoint.ts`
  - Own query value typing and `buildQuery`.

- Create `packages/api/src/types/envelope.ts`
  - Own `ApiEnvelope` import/export and `unwrapEnvelope`.

- Create `packages/api/src/types/course.ts`
  - Request/response DTOs for touched course endpoints.

- Create `packages/api/src/types/exam.ts`
  - Request/response DTOs for touched exam endpoints.

- Create or modify `packages/api/src/types/index.ts`
  - Barrel export API package DTOs.

- Modify `packages/api/src/modules/course.ts`
  - Convert to `createCourseApi(client)`.
  - Export legacy functions delegating to `api.course.*`.
  - Replace hand-built query strings with `query` option objects.

- Modify `packages/api/src/modules/exam.ts`
  - Convert to `createExamApi(client)`.
  - Export legacy functions delegating to `api.exam.*`.
  - Replace hand-built query strings with `query` option objects.

- Modify `packages/api/src/index.ts`
  - Export `createApi`.
  - Export default `api` facade.
  - Preserve legacy function exports.

- Create `packages/api/src/endpoint.test.mts`
  - Verify query helper behavior.

- Create `packages/api/src/modules/course.test.mts`
  - Verify module factory calls expected paths/methods/query/body through a mock client.

- Modify `apps/web/src/core/courses/api.ts`
  - Prefer `api.course.*` for touched calls.
  - Keep normalization unchanged.

- Modify `apps/web/src/core/exams/api.ts`
  - Prefer `api.exam.*` for touched calls.
  - Keep normalization unchanged.

- Modify `apps/web/src/core/exams/mutations.ts`
  - Prefer `api.exam.*` for mutations.

- Modify `AGENTS.md`
  - Add API layer governance rules from the spec.

- Modify `apps/web/AGENTS.md` if present and API-specific Web guidance needs a closer rule.

Do not run `git add` or create commits. The user explicitly forbade Git staging for future operations.

Testing policy for this slice:

- Keep `packages/api/src/endpoint.test.mts`; shared query behavior is foundational.
- Add one module-factory sample test for `course`; it documents the new API module pattern.
- Do not mechanically add a `.test.mts` for every API module.
- Add endpoint/module tests only when shared helpers change, parameter conversion has logic, GET inputs are easy to encode incorrectly, or the endpoint is high-risk such as auth, payment, exam submission, certificate, or user profile.

---

## Task 1: Add API Package Verification Entry Points

**Files:**
- Modify `packages/api/package.json`

- [ ] **Step 1: Inspect current package scripts**

Run:

```bash
sed -n '1,180p' packages/api/package.json
```

Expected: package has no `scripts` block.

- [ ] **Step 2: Add scripts**

Add:

```json
"scripts": {
  "test": "tsx --test src/*.test.mts src/**/*.test.mts",
  "typecheck": "tsc --noEmit"
}
```

Keep the existing `name`, `version`, `private`, `type`, and `exports`.

Also declare the package-local dependencies required by these scripts and existing imports:

```json
"dependencies": {
  "@workspace/shared": "workspace:*"
},
"devDependencies": {
  "@types/node": "^20",
  "tsx": "^4.20.6",
  "typescript": "^5"
}
```

- [ ] **Step 3: Verify script discovery**

Run:

```bash
pnpm --dir packages/api test
```

Expected: It may fail if existing tests reference old shapes, or pass if no matching tests run. Record the result before changing behavior.

---

## Task 2: Split Low-Level API Utilities

**Files:**
- Create `packages/api/src/errors.ts`
- Create `packages/api/src/endpoint.ts`
- Create `packages/api/src/types/envelope.ts`
- Create `packages/api/src/types/index.ts`
- Modify `packages/api/src/client.ts`
- Create `packages/api/src/endpoint.test.mts`

- [ ] **Step 1: Write query helper tests**

Create `packages/api/src/endpoint.test.mts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { buildQuery } from "./endpoint.ts";

test("buildQuery omits empty values and encodes present values", () => {
  assert.equal(
    buildQuery({
      id: 12,
      keyword: "期末 考试",
      empty: "",
      missing: undefined,
      nil: null,
      active: false,
    }),
    "?id=12&keyword=%E6%9C%9F%E6%9C%AB+%E8%80%83%E8%AF%95&active=false"
  );
});

test("buildQuery returns an empty string when no values remain", () => {
  assert.equal(buildQuery({ empty: "", missing: undefined, nil: null }), "");
});
```

- [ ] **Step 2: Run the endpoint test and verify failure**

Run:

```bash
pnpm --dir packages/api test -- src/endpoint.test.mts
```

Expected: FAIL because `packages/api/src/endpoint.ts` does not exist.

- [ ] **Step 3: Create `errors.ts`**

Move `ApiError` out of `client.ts`:

```ts
export class ApiError extends Error {
  public readonly code: number;
  public readonly status: number;

  constructor(message: string, code: number, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}
```

- [ ] **Step 4: Create `endpoint.ts`**

```ts
export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

export const buildQuery = (params: QueryParams = {}) => {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }

  const result = query.toString();
  return result ? `?${result}` : "";
};

export const withQuery = (path: string, params?: QueryParams) =>
  `${path}${buildQuery(params)}`;
```

- [ ] **Step 5: Create envelope types**

`packages/api/src/types/envelope.ts`:

```ts
import type { ApiEnvelope } from "@workspace/shared";

export type { ApiEnvelope };

export const unwrapEnvelope = <T>(payload: ApiEnvelope<T>) =>
  payload.result ?? payload.data ?? null;
```

`packages/api/src/types/index.ts`:

```ts
export * from "./envelope";
```

- [ ] **Step 6: Update `client.ts` imports and API shape**

Keep existing behavior, but import low-level pieces and add explicit request options:

```ts
import { buildQuery, type QueryParams } from "./endpoint";
import { ApiError } from "./errors";
import type { ApiEnvelope } from "./types";

export interface ApiClientOptions {
  baseUrl?: string;
  getToken?: () => string | null | undefined;
}

export interface ApiRequestOptions extends RequestInit {
  query?: QueryParams;
}

export interface ApiHttpClient {
  get: <T>(path: string, init?: ApiRequestOptions) => Promise<ApiEnvelope<T>>;
  post: <T>(
    path: string,
    body?: unknown,
    init?: ApiRequestOptions
  ) => Promise<ApiEnvelope<T>>;
}
```

Inside `request`, call `fetch(`${baseUrl}${path}${buildQuery(init.query)}`, ...)` and remove the custom `query` field before passing options into `fetch`.

Keep these exports from `client.ts` for compatibility:

```ts
export { ApiError } from "./errors";
export { buildQuery } from "./endpoint";
export { unwrapEnvelope } from "./types";
```

- [ ] **Step 7: Run endpoint tests**

Run:

```bash
pnpm --dir packages/api test -- src/endpoint.test.mts
```

Expected: PASS.

- [ ] **Step 8: Run package typecheck**

Run:

```bash
pnpm --dir packages/api typecheck
```

Expected: PASS or expose existing `.ts` extension import errors that Task 5 will fix.

---

## Task 3: Refactor Course API Module

**Files:**
- Create `packages/api/src/types/course.ts`
- Modify `packages/api/src/types/index.ts`
- Modify `packages/api/src/modules/course.ts`
- Create `packages/api/src/modules/course.test.mts`

- [ ] **Step 1: Add course DTOs**

Create `packages/api/src/types/course.ts`:

```ts
export type CourseListRequest = Record<string, unknown>;
export type CourseStudyTimeRequest = Record<string, unknown>;
export type CourseStudyProcessListRequest = Record<string, unknown>;
export type CourseEvaluationListRequest = Record<string, unknown>;

export type CourseListResponse = unknown;
export type CourseDetailResponse = unknown;
export type CourseCategoryListResponse = unknown;
export type CourseStudyDetailResponse = unknown;
export type CourseStudyProcessResponse = unknown;
export type CourseLatestStudyTaskResponse = unknown;
export type CourseTaskStudyTimeResponse = unknown;
export type CourseEvaluationListResponse = unknown;
export type CourseGradeCountResponse = unknown;
export type CourseIntegralResponse = unknown;
```

This intentionally starts broad. Narrow DTOs when endpoint shapes are known from stable backend contracts.

- [ ] **Step 2: Export course DTOs**

Add to `packages/api/src/types/index.ts`:

```ts
export * from "./course";
```

- [ ] **Step 3: Write course module factory test**

Create `packages/api/src/modules/course.test.mts` with a mock `ApiHttpClient`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { createCourseApi } from "./course.ts";
import type { ApiHttpClient } from "../client.ts";

const createMockClient = () => {
  const calls: unknown[] = [];
  const client: ApiHttpClient = {
    get: async (path, init) => {
      calls.push({ method: "GET", path, init });
      return { code: 200, message: "ok", result: null };
    },
    post: async (path, body, init) => {
      calls.push({ method: "POST", path, body, init });
      return { code: 200, message: "ok", result: null };
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
```

- [ ] **Step 4: Run course test and verify failure**

Run:

```bash
pnpm --dir packages/api test -- src/modules/course.test.mts
```

Expected: FAIL because `createCourseApi` is not exported.

- [ ] **Step 5: Refactor `modules/course.ts`**

Pattern:

```ts
import { api } from "../index";
import type { ApiHttpClient } from "../client";
import type { CourseListRequest } from "../types";

export const createCourseApi = (client: ApiHttpClient) => ({
  listCourses: (payload: CourseListRequest) =>
    client.post("/course/list", payload),
  getCourseDetail: ({ courseId }: { courseId: string | number }) =>
    client.get("/course/getCourseDetail", { query: { courseId } }),
});

export const getCourseList = (payload: CourseListRequest) =>
  api.course.listCourses(payload);
```

Apply the same style to all existing course functions. Use named parameter objects when a function has multiple inputs:

```ts
findUserCatalog: ({
  courseCatalogId,
  courseId,
}: {
  courseCatalogId: string | number;
  courseId: string | number;
}) =>
  client.get("/course/findUserCatalog", {
    query: { courseCatalogId, courseId },
  }),
```

Keep legacy exports with the old call signatures so current callers do not break.

- [ ] **Step 6: Run course module test**

Run:

```bash
pnpm --dir packages/api test -- src/modules/course.test.mts
```

Expected: PASS.

---

## Task 4: Refactor Exam API Module

**Files:**
- Create `packages/api/src/types/exam.ts`
- Modify `packages/api/src/types/index.ts`
- Modify `packages/api/src/modules/exam.ts`

- [ ] **Step 1: Add exam DTOs**

Create `packages/api/src/types/exam.ts`:

```ts
export type ExamListRequest = Record<string, unknown>;
export type ExamSubmitRequest = Record<string, unknown>;
export type ExamCacheAnswerRequest = Record<string, unknown>;
export type ExamSnapUploadRequest = Record<string, unknown>;

export type ExamListResponse = unknown;
export type ExamPreviewResponse = unknown;
export type ExamSessionResponse = unknown;
export type ExamDetailResponse = unknown;
export type ExamResultResponse = unknown;
export type ExamResultListResponse = unknown;
export type ExamDetailListResponse = unknown;
export type ExamLimitResponse = unknown;
```

- [ ] **Step 2: Export exam DTOs**

Add to `packages/api/src/types/index.ts`:

```ts
export * from "./exam";
```

- [ ] **Step 3: Refactor `modules/exam.ts`**

Pattern:

```ts
import { api } from "../index";
import type { ApiHttpClient } from "../client";
import type { ExamListRequest } from "../types";

export const createExamApi = (client: ApiHttpClient) => ({
  listExams: (payload: ExamListRequest) => client.post("/exam/list", payload),
  queryExamById: ({ id }: { id: string | number }) =>
    client.get("/exam/queryById", { query: { id } }),
});

export const getExamList = (payload: ExamListRequest) =>
  api.exam.listExams(payload);
```

Apply the same style to all existing exam functions. Keep legacy exports with old call signatures.

- [ ] **Step 4: Run API tests**

Run:

```bash
pnpm --dir packages/api test
```

Expected: PASS.

---

## Task 5: Create Namespaced API Facade

**Files:**
- Modify `packages/api/src/index.ts`
- Modify `packages/api/src/modules/course.ts`
- Modify `packages/api/src/modules/exam.ts`

- [ ] **Step 1: Update `index.ts`**

Create the namespace facade:

```ts
import { createApiClient, type ApiClientOptions } from "./client";
import { createCourseApi } from "./modules/course";
import { createExamApi } from "./modules/exam";

export const createApi = (options: ApiClientOptions = {}) => {
  const client = createApiClient(options);

  return {
    course: createCourseApi(client),
    exam: createExamApi(client),
  };
};

export const api = createApi();
```

Then export public APIs:

```ts
export * from "./client";
export * from "./endpoint";
export * from "./errors";
export * from "./types";
export * from "./modules/course";
export * from "./modules/exam";
```

Keep existing module exports for untouched modules.

- [ ] **Step 2: Avoid circular runtime traps**

If importing `api` from `../index` inside modules creates a circular initialization problem, change legacy delegates to use a module-local default facade helper:

```ts
const defaultCourseApi = createCourseApi(createApiClient());

export const getCourseList = (payload: CourseListRequest) =>
  defaultCourseApi.listCourses(payload);
```

Use this only if tests or runtime expose a circular issue. The preferred public API remains `api.course.*`.

- [ ] **Step 3: Fix `.ts` import extension errors**

Replace imports like:

```ts
import { createApiClient } from "../client.ts";
```

with:

```ts
import { createApiClient } from "../client";
```

Apply at least to:

- `packages/api/src/modules/certificate.ts`
- `packages/api/src/modules/user.ts`

- [ ] **Step 4: Run package tests and typecheck**

Run:

```bash
pnpm --dir packages/api test
pnpm --dir packages/api typecheck
```

Expected: PASS.

---

## Task 6: Migrate Web Course and Exam Domain Calls

**Files:**
- Modify `apps/web/src/core/courses/api.ts`
- Modify `apps/web/src/core/exams/api.ts`
- Modify `apps/web/src/core/exams/mutations.ts`

- [ ] **Step 1: Replace course imports**

In `apps/web/src/core/courses/api.ts`, replace direct function imports from `@workspace/api` with:

```ts
import { api, unwrapEnvelope } from "@workspace/api";
```

Update calls:

```ts
await api.course.listCourses(...)
await api.course.getCourseStudyDetail({ courseId })
await api.course.getCourseStudyProcess({ courseId })
await api.course.getLatestStudyTask({ courseId })
```

Preserve all normalization helpers and return shapes.

- [ ] **Step 2: Replace exam imports**

In `apps/web/src/core/exams/api.ts`, replace direct function imports from `@workspace/api` with:

```ts
import { api, unwrapEnvelope } from "@workspace/api";
```

Update calls:

```ts
await api.exam.listExams(...)
await api.exam.queryExamById({ id: examId })
await api.exam.examRecordExists({ examId })
await api.exam.checkExamLimit({ examId })
```

Use the exact method names implemented in Task 4. Preserve existing normalization.

- [ ] **Step 3: Replace exam mutation imports**

In `apps/web/src/core/exams/mutations.ts`, use:

```ts
import { api, unwrapEnvelope } from "@workspace/api";
```

Update calls:

```ts
unwrapEnvelope(await api.exam.createExamSession({ examId }))
unwrapEnvelope(await api.exam.submitExam(payload))
```

- [ ] **Step 4: Run focused ESLint**

Run:

```bash
pnpm --dir apps/web exec eslint src/core/courses src/core/exams src/components/courses src/components/exams
```

Expected: PASS.

- [ ] **Step 5: Run TypeScript**

Run:

```bash
pnpm --dir apps/web exec tsc --noEmit
```

Expected: PASS if unrelated historical errors are fixed. If not, report unrelated failures separately and confirm no failures point to changed API/course/exam files.

---

## Task 7: Add Governance Rules

**Files:**
- Modify `AGENTS.md`
- Modify `apps/web/AGENTS.md` only if present and needed

- [ ] **Step 1: Add root API rules**

In `AGENTS.md`, under API/domain rules, add:

```md
### API Package Rules

- New endpoint access must live in `packages/api`.
- API modules must expose a `createXxxApi(client)` factory.
- API modules must not instantiate their own client for primary endpoint definitions.
- API modules must not import React, Next.js, Zustand, UI packages, or Web domain code.
- API modules must use shared query helpers for GET parameters.
- Do not hand-build query strings such as `?id=${id}`.
- React Query queryOptions and mutations belong in `apps/web/src/core/<domain>`, not in `packages/api`.
- Page components must not call `@workspace/api` directly for domain data.
- Normalize backend payloads in Web domain core unless the transformation is a reusable protocol concern.
```

- [ ] **Step 2: Add Web-local clarification if needed**

If `apps/web/AGENTS.md` exists, add a shorter Web rule:

```md
## API Usage

- Web pages and components should call domain core functions, not `@workspace/api` directly.
- Put queryOptions and mutations in `apps/web/src/core/<domain>`.
- Keep page-specific normalization in domain core instead of `packages/api`.
```

- [ ] **Step 3: Verify docs formatting**

Run:

```bash
git diff --check -- AGENTS.md apps/web/AGENTS.md docs/superpowers/plans/2026-04-25-api-layer-governance.md
```

Expected: PASS.

---

## Task 8: Final Verification

**Files:**
- All files changed by Tasks 1-7

- [ ] **Step 1: Run API package verification**

Run:

```bash
pnpm --dir packages/api test
pnpm --dir packages/api typecheck
```

Expected: PASS.

- [ ] **Step 2: Run Web focused lint**

Run:

```bash
pnpm --dir apps/web exec eslint src/core/courses src/core/exams src/components/courses src/components/exams
```

Expected: PASS.

- [ ] **Step 3: Run Web TypeScript**

Run:

```bash
pnpm --dir apps/web exec tsc --noEmit
```

Expected: PASS or only known unrelated historical failures. If failures remain, list exact file paths and explain whether they are unrelated.

- [ ] **Step 4: Inspect API anti-patterns**

Run:

```bash
rg -n "const client = createApiClient\\(\\)|\\?[^`\"']*\\$\\{" packages/api/src/modules/course.ts packages/api/src/modules/exam.ts
```

Expected: no output for the touched modules.

- [ ] **Step 5: Inspect direct page API calls**

Run:

```bash
rg -n "@workspace/api" apps/web/src/components apps/web/src/app
```

Expected: no new direct API imports in touched course/exam pages. Existing legacy pages may still show direct imports and should be reported as out of scope.

---

## Implementation Notes

- Use `apply_patch` for manual edits.
- Do not stage files.
- Do not commit.
- Keep compatibility exports until all consumers have migrated.
- Keep DTOs broad where backend response shapes are not yet stable; narrow them when touching a known stable contract.
- Do not move normalization into `packages/api`.
- Do not introduce OpenAPI tooling in this slice.
