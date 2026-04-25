# API Layer Governance Design

## Context

The current `packages/api` package is the shared endpoint access layer for the Web app. Its files are inconsistent:

- Most modules create their own `createApiClient()` instance.
- Some modules expose plain functions, while others expose `createXxxModule(options)`.
- GET query strings are sometimes hand-built and sometimes use `buildQuery`.
- Some imports use `.ts` extensions, which breaks the current TypeScript setup.
- API envelope unwrapping and domain normalization are spread across Web domain code.

The Multica project is a reference for governance style, not a template to copy verbatim. The relevant lesson is a headless API/core layer with explicit boundaries: views do not own request details, and React Query queries/mutations sit around a stable API client.

This project is not building mobile-web now. The API layer should stay headless because that is the right boundary for Web quality, testability, and future maintenance, not because mobile support is a current goal.

## Goals

- Make `packages/api` the single place for endpoint access.
- Make API modules consistent and easy for AI agents to copy.
- Keep React, Next.js, Zustand, UI, and page-specific domain models out of `packages/api`.
- Preserve gradual migration by keeping legacy function exports during the transition.
- Leave room for future OpenAPI/Orval generation without depending on it now.
- Improve verification with focused tests for low-level request/query behavior.

## Non-Goals

- Do not build mobile-web support.
- Do not move all Web domain normalization into `packages/api`.
- Do not rewrite every API module in one pass.
- Do not require OpenAPI/Swagger before improving the current code.
- Do not delete legacy API function exports until consumers have migrated.

## Proposed Architecture

Use three distinct layers.

```text
packages/api
  src/client.ts          # HTTP client factory and request execution
  src/errors.ts          # ApiError and low-level error helpers
  src/endpoint.ts        # query string and endpoint helpers
  src/types/             # API envelope, request DTOs, response DTOs
  src/modules/           # endpoint modules built from an injected client
  src/index.ts           # stable public exports

apps/web/src/core/<domain>
  api.ts                 # calls packages/api and normalizes API payloads
  queries.ts             # React Query query keys and queryOptions
  mutations.ts           # mutation hooks and cache invalidation
  types.ts               # Web domain models consumed by components
```

`packages/api` owns transport and endpoint contracts. `apps/web/src/core/<domain>` owns Web domain shaping and React Query integration.

## API Package Shape

Each module should export a factory that receives a shared HTTP client.

```ts
export const createCourseApi = (client: ApiHttpClient) => ({
  listCourses: (params: CourseListRequest) =>
    client.post<CourseListResponse>("/course/list", params),

  getCourseDetail: (params: CourseDetailRequest) =>
    client.get<CourseDetailResponse>("/course/getCourseDetail", {
      query: { courseId: params.courseId },
    }),
});
```

The package entrypoint creates a namespaced facade.

```ts
export const createApi = (options: ApiClientOptions = {}) => {
  const client = createApiClient(options);

  return {
    course: createCourseApi(client),
    exam: createExamApi(client),
    user: createUserApi(client),
  };
};

export const api = createApi();
```

Consumers should prefer:

```ts
import { api } from "@workspace/api";

const response = await api.course.listCourses(payload);
```

During migration, legacy functions remain as compatibility exports and delegate to the namespaced API:

```ts
export const getCourseList = (payload: CourseListRequest) =>
  api.course.listCourses(payload);
```

## Endpoint and Query Rules

- No API module may call `createApiClient()` directly.
- No API module may hand-build query strings such as `?id=${id}`.
- GET parameters must go through the shared query helper.
- Query helpers omit `undefined`, `null`, and empty string values.
- Endpoint functions should accept named parameter objects when there is more than one input.
- DTO types should be exported from `packages/api/src/types`.
- Avoid `Record<string, unknown>` for newly touched endpoints when the request shape is known.
- Do not import with `.ts` extensions inside TypeScript source.

## Domain Layer Rules

Web domain code may unwrap envelopes, normalize legacy payloads, and map unstable backend fields into stable page models.

Examples that belong in `apps/web/src/core/<domain>/api.ts`:

- fallback display labels
- list payload compatibility across `records`, `list`, and `rows`
- field aliases from old backend responses
- page-specific empty defaults

Examples that belong in `packages/api`:

- endpoint paths
- HTTP method
- request DTO
- raw response DTO
- authentication headers
- API envelope handling primitives
- transport-level errors

React Query belongs in `apps/web/src/core/<domain>/queries.ts` and `mutations.ts`, not in `packages/api`.

## Migration Plan

Start with `course` and `exam` because those domains are current reference patterns.

1. Add shared low-level API utilities:
   - `errors.ts`
   - `endpoint.ts`
   - `types/envelope.ts`
   - updated `client.ts`

2. Refactor `course` and `exam` modules:
   - introduce `createCourseApi(client)`
   - introduce `createExamApi(client)`
   - expose `api.course.*` and `api.exam.*`
   - keep old function exports as delegates

3. Update Web domain callers:
   - `apps/web/src/core/courses/api.ts`
   - `apps/web/src/core/exams/api.ts`
   - `apps/web/src/core/exams/mutations.ts`

4. Update governance docs:
   - `AGENTS.md`
   - `apps/web/AGENTS.md` if Web-specific API usage needs clarification

5. Continue with high-value modules:
   - `certificate`
   - `user`
   - score-related endpoints

Legacy exports can be removed later only after all consumers have migrated.

## Testing and Verification

Add focused tests for the low-level API package:

- query builder omits empty values and encodes values correctly
- `ApiError` preserves status/code/message
- request client unwraps expected envelope shapes or exposes consistent response behavior
- module factories call the expected path/method/query/body through a mock client

For the first implementation slice, run:

```bash
pnpm --dir apps/web exec eslint src/core/courses src/core/exams src/components/courses src/components/exams
pnpm --dir apps/web exec tsc --noEmit
git diff --check
```

If `tsc` still fails on unrelated historical files, report the exact unrelated failures separately.

## Governance Rules To Add

Add these rules to the repository agent contract:

- New endpoint access must live in `packages/api`.
- API modules must use `createXxxApi(client)`.
- API modules must not instantiate their own client.
- API modules must not import React, Next.js, Zustand, UI packages, or Web domain code.
- API modules must use shared query helpers for GET parameters.
- Web domain queryOptions and mutations belong in `apps/web/src/core/<domain>`.
- Page components must not call `@workspace/api` directly for domain data.
- Normalize backend payloads in Web domain core unless the transformation is a reusable protocol concern.

