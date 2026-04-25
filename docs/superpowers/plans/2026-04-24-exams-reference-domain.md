# Exams Reference Domain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Web exams list and preview code into a cleaner reference domain with UI-only components and data/query logic owned by `core/exams`.

**Architecture:** Keep Next route files thin, keep `components/exams` focused on rendering, and move exam API adaptation, query keys, query options, config, types, mutations, and client state into `apps/web/src/core/exams`. Components call `useQuery(examQueryOptions.xxx(...))` directly; API failures intentionally collapse into empty/unavailable states without raw error details.

**Tech Stack:** Next.js App Router, React, TanStack Query, TanStack Form, Zustand, pnpm, TypeScript, shadcn/workspace UI.

---

## Source Spec

- Spec: `docs/superpowers/specs/2026-04-24-exams-reference-domain-design.md`
- Rules: `AGENTS.md`
- App rules: `apps/web/AGENTS.md`

## Current Worktree State

This plan is written for the current worktree, which already contains staged React Query/exams migration work. Do not reset, checkout, or discard those changes.

Expected staged files before implementation include:

- `apps/web/src/app/(student)/exams/page.tsx`
- `apps/web/src/components/exams/exams-page-shell.tsx`
- `apps/web/src/components/exams/exams-filters.tsx`
- `apps/web/src/components/exams/exams-results.tsx`
- `apps/web/src/components/exams/exams-types.ts`
- `apps/web/src/components/exams/exams-data.ts`
- `apps/web/src/components/exams/preview/exam-preview-page-shell.tsx`
- `apps/web/src/components/exams/preview/exam-preview-data.ts`
- `apps/web/src/core/exams/config/index.ts`
- `apps/web/src/core/exams/hooks.ts`
- `apps/web/src/core/exams/index.ts`
- `apps/web/src/core/exams/mutations.ts`
- `apps/web/src/core/exams/queries.ts`
- `apps/web/src/core/exams/store.ts`

Also expect unrelated staged files from prior work, such as home/query-provider changes. Do not modify, unstage, or revert those unrelated files.

## File Structure

- Create: `apps/web/src/core/exams/api.ts`
  - Owns exam API calls and safe payload adaptation.
  - Returns empty/unavailable fallbacks on API failure.
- Create: `apps/web/src/core/exams/types.ts`
  - Owns exam domain types used by routes, components, API adapters, and query options.
- Create: `apps/web/src/core/exams/config.ts`
  - Replaces `apps/web/src/core/exams/config/index.ts`.
  - Owns page size and filter option constants.
- Modify: `apps/web/src/core/exams/queries.ts`
  - Imports API functions from `./api`.
  - Exports `examKeys` and `examQueryOptions`.
- Modify: `apps/web/src/core/exams/mutations.ts`
  - Convert function declarations to arrow exports.
  - Keep explicit invalidation through `examKeys`.
- Modify: `apps/web/src/core/exams/store.ts`
  - Convert to arrow-friendly style if needed.
  - Keep client state only.
- Modify: `apps/web/src/core/exams/index.ts`
  - Export `store`, `queries`, `mutations`, `config`, and `types`.
  - Do not export `hooks`.
- Delete: `apps/web/src/core/exams/hooks.ts`
- Rename: `apps/web/src/components/exams/exams-page-shell.tsx` -> `apps/web/src/components/exams/page.tsx`
- Rename: `apps/web/src/components/exams/exams-filters.tsx` -> `apps/web/src/components/exams/filters.tsx`
- Rename: `apps/web/src/components/exams/exams-results.tsx` -> `apps/web/src/components/exams/results.tsx`
- Delete: `apps/web/src/components/exams/exams-data.ts`
- Delete: `apps/web/src/components/exams/exams-types.ts`
- Rename: `apps/web/src/components/exams/preview/exam-preview-page-shell.tsx` -> `apps/web/src/components/exams/preview/page.tsx`
- Delete: `apps/web/src/components/exams/preview/exam-preview-data.ts`
- Delete: `apps/web/src/components/exams/exams-page-shell.test.mts`
- Delete: `apps/web/src/components/exams/preview/exam-preview-page-shell.test.mts`
- Modify: `apps/web/src/app/(student)/exams/page.tsx`
  - Import `ExamsPage` from `@/components/exams/page`.
  - Use arrow-function route default export.
  - Update description to avoid promising raw error state.
- Modify: `apps/web/src/app/(student)/exams/[examId]/preview/page.tsx`
  - Import `ExamPreviewPage` from `@/components/exams/preview/page`.
  - Use arrow-function route default export.
  - Update description to generic unavailable/empty behavior.

---

### Task 1: Snapshot Current Exams State

**Files:**
- Inspect only.

- [ ] **Step 1: Confirm staged and unstaged state**

Run:

```bash
git status --short
git diff --cached --name-status
git diff --name-status
```

Expected: Existing app changes are staged. Do not reset or unstage them.

- [ ] **Step 2: Inspect exams files before moving**

Run:

```bash
find apps/web/src/components/exams apps/web/src/core/exams 'apps/web/src/app/(student)/exams' -maxdepth 4 -type f 2>/dev/null | sort
sed -n '1,220p' apps/web/src/components/exams/exams-data.ts
sed -n '1,220p' apps/web/src/components/exams/preview/exam-preview-data.ts
sed -n '1,220p' apps/web/src/core/exams/queries.ts
```

Expected: You can see the existing list adapter, preview adapter, and query options before moving code.

- [ ] **Step 3: Check there are no accidental root docs pending**

Run:

```bash
git status --short docs/superpowers/specs docs/superpowers/plans
```

Expected: The spec is already committed; only this plan may be untracked while writing/executing plans.

---

### Task 2: Move Files to the Target Names

**Files:**
- Rename: `apps/web/src/components/exams/exams-page-shell.tsx` -> `apps/web/src/components/exams/page.tsx`
- Rename: `apps/web/src/components/exams/exams-filters.tsx` -> `apps/web/src/components/exams/filters.tsx`
- Rename: `apps/web/src/components/exams/exams-results.tsx` -> `apps/web/src/components/exams/results.tsx`
- Rename: `apps/web/src/components/exams/preview/exam-preview-page-shell.tsx` -> `apps/web/src/components/exams/preview/page.tsx`
- Rename: `apps/web/src/core/exams/config/index.ts` -> `apps/web/src/core/exams/config.ts`
- Delete later: old tests and old data/type files after their content is moved.

- [ ] **Step 1: Rename UI and config files with git**

Run:

```bash
git mv apps/web/src/components/exams/exams-page-shell.tsx apps/web/src/components/exams/page.tsx
git mv apps/web/src/components/exams/exams-filters.tsx apps/web/src/components/exams/filters.tsx
git mv apps/web/src/components/exams/exams-results.tsx apps/web/src/components/exams/results.tsx
git mv apps/web/src/components/exams/preview/exam-preview-page-shell.tsx apps/web/src/components/exams/preview/page.tsx
git mv apps/web/src/core/exams/config/index.ts apps/web/src/core/exams/config.ts
```

Expected: Git records renames. `apps/web/src/core/exams/config/` may be empty after the move.

- [ ] **Step 2: Remove empty config directory if present**

Run:

```bash
rmdir apps/web/src/core/exams/config 2>/dev/null || true
```

Expected: Empty directory is removed or command no-ops.

- [ ] **Step 3: Delete source-string tests**

Run:

```bash
git rm apps/web/src/components/exams/exams-page-shell.test.mts
git rm apps/web/src/components/exams/preview/exam-preview-page-shell.test.mts
```

Expected: The two `.test.mts` source-string tests are deleted. Do not add replacement tests in this pass.

- [ ] **Step 4: Verify move state**

Run:

```bash
find apps/web/src/components/exams apps/web/src/core/exams -maxdepth 3 -type f | sort
git status --short apps/web/src/components/exams apps/web/src/core/exams
```

Expected: New filenames exist, old shell/filter/result test filenames no longer exist except data/type files that will be removed after migration.

---

### Task 3: Create Core Types and Config

**Files:**
- Create: `apps/web/src/core/exams/types.ts`
- Modify: `apps/web/src/core/exams/config.ts`
- Delete later: `apps/web/src/components/exams/exams-types.ts`

- [ ] **Step 1: Create `core/exams/types.ts`**

Move the exported types from `apps/web/src/components/exams/exams-types.ts` into `apps/web/src/core/exams/types.ts`.

Use this target shape:

```ts
import type { ExamStatusFilter, ExamTypeFilter } from "./config";

export interface ExamFiltersState {
  examTitle: string;
  examType: ExamTypeFilter;
  state: ExamStatusFilter;
  pageNo: number;
  pageSize: number;
}

export interface ExamListItem {
  id: string;
  examId: string;
  title: string;
  summary: string;
  timeText: string;
  status: Exclude<ExamStatusFilter, "">;
  statusLabel: string;
  typeLabel: string;
  attendeeText: string;
  actionLabel: string;
}

export interface ExamListResult {
  items: ExamListItem[];
  total: number;
}

export interface ExamPreview {
  id: string;
  title: string;
  summary: string;
  description: string;
  schedule: Array<{ label: string; value: string }>;
  stats: Array<{ label: string; value: string }>;
  instructions: string[];
  startDisabled: boolean;
  startLabel: string;
  startHint: string;
}
```

- [ ] **Step 2: Keep `core/exams/config.ts` focused on constants and labels**

Make `apps/web/src/core/exams/config.ts` export:

```ts
export const EXAMS_PAGE_SIZE = 9;

export const EXAM_TYPE_OPTIONS = [
  { value: "1", label: "公开考试" },
  { value: "2", label: "我的考试" },
] as const;

export const EXAM_STATUS_OPTIONS = [
  { value: "", label: "全部" },
  { value: "0", label: "进行中" },
  { value: "2", label: "未开始" },
  { value: "3", label: "已结束" },
] as const;

export type ExamTypeFilter = (typeof EXAM_TYPE_OPTIONS)[number]["value"];
export type ExamStatusFilter = (typeof EXAM_STATUS_OPTIONS)[number]["value"];
```

Optional: add small label helpers or maps only if they simplify component/API code. Keep them in this file.

- [ ] **Step 3: Delete old component types file**

Run:

```bash
git rm apps/web/src/components/exams/exams-types.ts
```

Expected: components will later import types from `@/core/exams`.

---

### Task 4: Move API Adapters Into Core

**Files:**
- Create: `apps/web/src/core/exams/api.ts`
- Delete: `apps/web/src/components/exams/exams-data.ts`
- Delete: `apps/web/src/components/exams/preview/exam-preview-data.ts`

- [ ] **Step 1: Create `core/exams/api.ts`**

Move the useful content from:

- `apps/web/src/components/exams/exams-data.ts`
- `apps/web/src/components/exams/preview/exam-preview-data.ts`

into `apps/web/src/core/exams/api.ts`.

Implementation requirements:

- Import API functions from `@workspace/api`.
- Import boundary helpers from `@/lib/normalize`.
- Import config/types from `./config` and `./types`.
- Convert all function declarations to arrow functions.
- Export only:
  - `fetchExamList`
  - `fetchExamPreview`
- Keep helper functions module-local.
- Do not export `normalizeExamError` or `normalizeExamPreviewError`.

Key target signatures:

```ts
export const fetchExamList = async (
  filters: ExamFiltersState
): Promise<ExamListResult> => {
  try {
    const response = await getExamList(
      filters as unknown as Record<string, unknown>
    );
    const payload = toListPayload(unwrapEnvelope(response));

    return {
      items: payload.records.map(toExamListItem),
      total: payload.total,
    };
  } catch {
    return { items: [], total: 0 };
  }
};

export const fetchExamPreview = async (
  examId: string
): Promise<ExamPreview | null> => {
  try {
    const [detailResult, recordResult, limitResult] = await Promise.allSettled([
      queryExamById(examId),
      examRecordExist(examId),
      checkExamLimit(examId),
    ]);

    if (detailResult.status === "rejected") {
      return null;
    }

    const detail = unwrapEnvelope(detailResult.value);
    const hasRecord =
      recordResult.status === "fulfilled"
        ? Boolean(unwrapEnvelope(recordResult.value))
        : false;
    const reachedLimit =
      limitResult.status === "fulfilled"
        ? Boolean(unwrapEnvelope(limitResult.value))
        : false;

    return toExamPreview(examId, detail, { hasRecord, reachedLimit });
  } catch {
    return null;
  }
};
```

Use `toExamListItem` and `toExamPreview` as the adapter helper names instead of `normalize...` if practical; this keeps the code closer to "convert at the boundary" language.

- [ ] **Step 2: Preserve safe fallback behavior**

Confirm `api.ts` has no UI-facing raw error exports:

```bash
rg -n "normalizeExamError|normalizeExamPreviewError|NEXT_PUBLIC_API_BASE_URL|网络请求失败|throw" apps/web/src/core/exams/api.ts
```

Expected:

- No `normalizeExamError`.
- No `normalizeExamPreviewError`.
- No `NEXT_PUBLIC_API_BASE_URL`.
- No raw network message.
- No thrown API errors from `fetchExamList` / `fetchExamPreview`.

- [ ] **Step 3: Delete old data adapter files**

Run:

```bash
git rm apps/web/src/components/exams/exams-data.ts
git rm apps/web/src/components/exams/preview/exam-preview-data.ts
```

Expected: Components no longer own API/data adaptation files.

---

### Task 5: Update Query Options, Mutations, Store, and Index

**Files:**
- Modify: `apps/web/src/core/exams/queries.ts`
- Modify: `apps/web/src/core/exams/mutations.ts`
- Modify: `apps/web/src/core/exams/store.ts`
- Modify: `apps/web/src/core/exams/index.ts`
- Delete: `apps/web/src/core/exams/hooks.ts`

- [ ] **Step 1: Update `queries.ts` imports and types**

Change `apps/web/src/core/exams/queries.ts` so it imports API functions from `./api` and types from `./types`:

```ts
import { queryOptions } from "@tanstack/react-query";
import { fetchExamList, fetchExamPreview } from "./api";
import type { ExamFiltersState } from "./types";
```

Keep `examKeys` and `examQueryOptions` centralized. Convert any function declarations to arrow functions if present.

- [ ] **Step 2: Convert mutation hooks to arrow exports**

In `apps/web/src/core/exams/mutations.ts`, keep behavior but convert exports to arrow style:

```ts
export const useCreateExamSessionMutation = () => {
  const qc = useQueryClient();
  return useMutation({ ... });
};

export const useSubmitExamMutation = () => {
  const qc = useQueryClient();
  return useMutation({ ... });
};
```

Also format long `unwrapEnvelope(await ...)` calls over multiple lines if needed.

- [ ] **Step 3: Keep store client-only**

Confirm `apps/web/src/core/exams/store.ts` only contains `activeExamId` and `setActiveExam`.

Run:

```bash
sed -n '1,120p' apps/web/src/core/exams/store.ts
```

Expected: No API data, no list, no preview data.

- [ ] **Step 4: Update `index.ts` public surface**

Change `apps/web/src/core/exams/index.ts` to:

```ts
export * from "./api";
export * from "./config";
export * from "./mutations";
export * from "./queries";
export * from "./store";
export * from "./types";
```

Do not export `./hooks`.

- [ ] **Step 5: Delete `hooks.ts`**

Run:

```bash
git rm apps/web/src/core/exams/hooks.ts
```

Expected: No `core/exams/hooks.ts`.

---

### Task 6: Update Exams List Components

**Files:**
- Modify: `apps/web/src/components/exams/page.tsx`
- Modify: `apps/web/src/components/exams/filters.tsx`
- Modify: `apps/web/src/components/exams/results.tsx`

- [ ] **Step 1: Update list page imports**

In `apps/web/src/components/exams/page.tsx`:

- Import `useQuery` from `@tanstack/react-query`.
- Import `ExamsFilters` from `./filters`.
- Import `ExamsResults` from `./results`.
- Import `examQueryOptions`, `useExamStore`, config constants, and types from `@/core/exams`.
- Remove imports from `./exams-*`.
- Remove `useExamListQuery`.

Expected shape:

```ts
import { useQuery } from "@tanstack/react-query";
import { ExamsFilters } from "./filters";
import { ExamsResults } from "./results";
import {
  EXAMS_PAGE_SIZE,
  EXAM_STATUS_OPTIONS,
  EXAM_TYPE_OPTIONS,
  examQueryOptions,
  useExamStore,
  type ExamFiltersState,
  type ExamListItem,
  type ExamStatusFilter,
  type ExamTypeFilter,
} from "@/core/exams";
```

- [ ] **Step 2: Rename exported component**

Change:

```ts
export function ExamsPageShell(...)
```

to:

```ts
export const ExamsPage = ({ initialFilters }: { initialFilters: ExamFiltersState }) => {
  ...
};
```

Convert `createQueryString`, `getStatusSummary`, `getTypeSummary`, `navigate`, `updateType`, `updateStatus`, and `handleOpenExam` to arrow functions.

- [ ] **Step 3: Use React Query directly**

Replace:

```ts
const examsQuery = useExamListQuery(initialFilters);
const error = examsQuery.error;
```

with:

```ts
const examsQuery = useQuery(examQueryOptions.list(initialFilters));
```

Then derive:

```ts
const items: ExamListItem[] = examsQuery.data?.items ?? [];
const total = examsQuery.data?.total ?? 0;
const isLoading = examsQuery.isLoading;
```

Remove `error` handling and raw retry state from the list page.

- [ ] **Step 4: Update overview copy**

In `overviewItems`, replace the error-aware result count:

```ts
value: error ? "接口异常" : isLoading ? "加载中" : `${total} 条`,
```

with:

```ts
value: isLoading ? "加载中" : `${total} 条`,
```

- [ ] **Step 5: Update `ExamsResults` usage**

Change:

```tsx
<ExamsResults
  items={items}
  loading={isLoading}
  error={error}
  onRetry={() => void examsQuery.refetch()}
  onOpen={handleOpenExam}
/>
```

to:

```tsx
<ExamsResults items={items} loading={isLoading} onOpen={handleOpenExam} />
```

- [ ] **Step 6: Remove `useEffect` from filters**

In `apps/web/src/components/exams/filters.tsx`:

- Remove `useEffect` import.
- Remove the `useEffect(() => form.reset(defaultValues), ...)` block.
- Change exported component to arrow style:

```ts
export const ExamsFilters = (...) => {
  ...
};
```

Keep explicit reset button behavior.

- [ ] **Step 7: Simplify results error handling**

In `apps/web/src/components/exams/results.tsx`:

- Remove `error` and `onRetry` props.
- Remove the error panel branch.
- Convert `getStatusPresentation`, `ExamsLoadingState`, and `ExamsResults` to arrow functions.
- Keep loading and empty states.

Target props:

```ts
export const ExamsResults = ({
  items,
  loading,
  onOpen,
}: {
  items: ExamListItem[];
  loading: boolean;
  onOpen: (item: ExamListItem) => void;
}) => {
  ...
};
```

---

### Task 7: Update Exam Preview Component

**Files:**
- Modify: `apps/web/src/components/exams/preview/page.tsx`

- [ ] **Step 1: Update preview imports**

In `apps/web/src/components/exams/preview/page.tsx`:

- Import `useQuery` from `@tanstack/react-query`.
- Import `examQueryOptions` from `@/core/exams`.
- Remove `useExamPreviewQuery`.

Expected:

```ts
import { useQuery } from "@tanstack/react-query";
import { examQueryOptions } from "@/core/exams";
```

- [ ] **Step 2: Convert helper components and main component to arrows**

Convert:

- `ExamPreviewLoadingState`
- `ExamPreviewEmptyState`
- `ExamPreviewPage`
- `handleStartExam`

to arrow-function style.

- [ ] **Step 3: Use React Query directly**

Replace:

```ts
const previewQuery = useExamPreviewQuery(examId);
const error = previewQuery.error;
```

with:

```ts
const previewQuery = useQuery(examQueryOptions.preview(examId));
const preview = previewQuery.data;
const isLoading = previewQuery.isLoading;
```

- [ ] **Step 4: Remove raw error panel branch**

Delete the `if (error) { ... }` branch entirely.

Keep:

```tsx
if (isLoading) return <ExamPreviewLoadingState />;
if (!preview) return <ExamPreviewEmptyState />;
```

Expected: Preview API failure returns `null` from `core/exams/api.ts`, so the component renders generic empty/unavailable UI.

- [ ] **Step 5: Normalize formatting**

Format dense JSX lines for readability, especially:

- `MotionStagger` loading block.
- `MotionReveal` empty block.
- Hero title.
- schedule/stat/instruction cards.
- start-action section.

Expected: `preview/page.tsx` is readable enough to be a reference file.

---

### Task 8: Update Next Route Files

**Files:**
- Modify: `apps/web/src/app/(student)/exams/page.tsx`
- Modify: `apps/web/src/app/(student)/exams/[examId]/preview/page.tsx`

- [ ] **Step 1: Update exams list route import and export style**

In `apps/web/src/app/(student)/exams/page.tsx`:

- Import `ExamsPage` from `@/components/exams/page`.
- Convert helper functions to arrow functions.
- Convert default export to named const + default export.
- Update description to avoid promising error state.

Target route shape:

```ts
const ExamsRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;
  ...

  return (
    <StudentShell
      title="在线考试"
      description="迁移旧学员端考试列表页到 Next.js 学员端，支持公开考试/我的考试切换、状态筛选、关键词搜索与分页浏览。"
    >
      <ExamsPage initialFilters={initialFilters} />
    </StudentShell>
  );
};

export default ExamsRoute;
```

- [ ] **Step 2: Update preview route import and export style**

In `apps/web/src/app/(student)/exams/[examId]/preview/page.tsx`:

- Import `ExamPreviewPage` from `@/components/exams/preview/page`.
- Convert default export to named const + default export.
- Update description to generic unavailable behavior.

Target route shape:

```ts
const ExamPreviewRoute = async ({
  params,
}: {
  params: Promise<{ examId: string }>;
}) => {
  const routeParams = await params;

  return (
    <StudentShell
      title="考试预览"
      description="查看考试标题、说明、基础统计与开始入口；接口不可用时展示安全的不可用状态。"
    >
      <ExamPreviewPage examId={routeParams.examId} />
    </StudentShell>
  );
};

export default ExamPreviewRoute;
```

---

### Task 9: Remove Dead Imports and Old Names

**Files:**
- Verify all modified exams files.

- [ ] **Step 1: Search for old filenames and exports**

Run:

```bash
rg -n "exams-page-shell|exams-filters|exams-results|exams-types|exams-data|exam-preview-page-shell|exam-preview-data|ExamsPageShell|ExamPreviewPageShell|useExamListQuery|useExamPreviewQuery|normalizeExamError|normalizeExamPreviewError" apps/web/src
```

Expected: No matches.

- [ ] **Step 2: Search for forbidden component-to-core dependency**

Run:

```bash
rg -n "@/components/exams|components/exams|\\.\\./components" apps/web/src/core/exams
```

Expected: No matches. `core/exams` must not import from components.

- [ ] **Step 3: Search for function declarations in modified exams files**

Run:

```bash
rg -n "^function |^export function |^export default async function" apps/web/src/components/exams apps/web/src/core/exams 'apps/web/src/app/(student)/exams'
```

Expected: No matches in the modified exams domain and route files.

- [ ] **Step 4: Confirm tests are gone**

Run:

```bash
find apps/web/src/components/exams -name '*.test.mts' -print
```

Expected: No output for exams component tests.

---

### Task 10: Verification and Handoff

**Files:**
- Verify changed exams files.
- Do not commit implementation code in this plan because unrelated app changes are already staged.

- [ ] **Step 1: Run lint**

Run:

```bash
pnpm --filter web lint
```

Expected: Pass. If it fails because of unrelated pre-existing staged changes outside exams, record exact files and errors.

- [ ] **Step 2: Run build**

Run:

```bash
pnpm --filter web build
```

Expected: Pass. If it fails because of unrelated pre-existing staged changes outside exams, record exact files and errors.

- [ ] **Step 3: Optionally run web tests to understand remaining suite**

Run:

```bash
pnpm --filter web test
```

Expected: This may pass, fail, or report no matching tests depending on remaining test files. Do not add tests in this pass. Record the result.

- [ ] **Step 4: Verify domain import boundaries**

Run:

```bash
rg -n "@/components/exams|components/exams|\\.\\./components|next/" apps/web/src/core/exams
```

Expected: No matches. `core/exams` must not import from components or Next platform APIs.

- [ ] **Step 5: Inspect status and diff scope**

Run:

```bash
git status --short
git diff --cached --name-status
git diff --name-status
```

Expected:

- Exams old filenames are deleted or renamed.
- New `components/exams/page.tsx`, `filters.tsx`, `results.tsx`, `preview/page.tsx` exist.
- New `core/exams/api.ts`, `config.ts`, `types.ts` exist.
- `core/exams/hooks.ts` is deleted.
- Existing unrelated staged files are still present if they were present before.

- [ ] **Step 6: Do not commit implementation code**

Do not run `git commit` as part of executing this plan. The worktree already contains unrelated staged app changes, so committing here could create scope creep. Leave the final staged state visible for human review or a separate explicit commit instruction.

- [ ] **Step 7: Report result**

Final report should include:

- File moves.
- Deleted tests.
- Removal of `hooks.ts`.
- Confirmation that `core/exams` no longer imports from components.
- Confirmation that `core/exams` does not import `next/*`.
- Verification commands and results.
- Any unrelated staged changes that were left untouched.
- Explicit note that no implementation commit was created.
