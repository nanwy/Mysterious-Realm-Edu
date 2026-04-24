# Exams Reference Domain Refactor Design

**Date:** 2026-04-24

## Background

The `apps/web/src/components/exams` and `apps/web/src/core/exams` files are intended to become the reference pattern for future page migrations. The current work-in-progress already moves exams toward a domain-core shape, but it still has problems that would make it a weak example:

- Component files repeat the domain name in filenames, such as `exams-page-shell.tsx`.
- The term `shell` makes the page component feel like a generic container instead of a specific page composition.
- `core/exams` currently contains thin hooks that mostly wrap React Query without enough value.
- `core/exams` imports data adapters from `components/exams`, which reverses the intended dependency direction.
- Data normalization and API handling still live under the component directory.
- Preview files are denser and less consistent than the list page files.
- Current `.test.mts` files assert source strings rather than behavior and should not be treated as a reference testing style.

The user wants the `exams` domain to be a clear frontend example, not a maximal abstraction.

## Goals

- Refactor both the exams list page and exam preview page into a cleaner reference domain.
- Keep `components/exams` focused on UI composition and rendering.
- Move API access, field adaptation, query options, types, config, mutations, and Zustand state into `core/exams`.
- Remove thin custom hooks and let components call `useQuery(examQueryOptions.xxx(...))` directly.
- Rename files so the directory supplies domain context instead of repeating `exams-` in every filename.
- Use arrow-function style consistently for this domain.
- Hide technical API error details from the UI.
- Delete the current source-string tests instead of preserving them as a model.

## Non-Goals

- Do not refactor unrelated domains.
- Do not introduce package-level `packages/api` changes in this pass.
- Do not add new tests in this pass.
- Do not create a generic app-wide page pattern abstraction.
- Do not preserve raw API error details in the exams UI.
- Do not add thin custom hooks just to wrap React Query.

## Source References

- `AGENTS.md`
- `apps/web/AGENTS.md`
- `docs/superpowers/specs/2026-04-24-codex-agent-governance-design.md`
- `apps/web/src/components/exams`
- `apps/web/src/core/exams`
- Vercel React best practices skill:
  - `bundle-barrel-imports`
  - `rerender-no-inline-components`
  - `rerender-dependencies`
  - `rerender-move-effect-to-event`
  - `js-early-exit`
  - `js-set-map-lookups`
- Multica frontend references:
  - `/Users/nanfugongmeiying/Desktop/project/multica/packages/core/issues/queries.ts`
  - `/Users/nanfugongmeiying/Desktop/project/multica/packages/views/issues/components/issues-page.tsx`
  - `/Users/nanfugongmeiying/Desktop/project/multica/apps/web/platform/navigation.tsx`
  - `/Users/nanfugongmeiying/Desktop/project/multica/packages/core/query-client.ts`

## Proposed Structure

```text
apps/web/src/components/exams/
  page.tsx
  filters.tsx
  results.tsx
  preview/
    page.tsx

apps/web/src/core/exams/
  api.ts
  config.ts
  index.ts
  mutations.ts
  queries.ts
  store.ts
  types.ts
```

## File Moves

- `apps/web/src/components/exams/exams-page-shell.tsx` -> `apps/web/src/components/exams/page.tsx`
- `apps/web/src/components/exams/exams-filters.tsx` -> `apps/web/src/components/exams/filters.tsx`
- `apps/web/src/components/exams/exams-results.tsx` -> `apps/web/src/components/exams/results.tsx`
- `apps/web/src/components/exams/exams-types.ts` -> `apps/web/src/core/exams/types.ts`
- `apps/web/src/components/exams/exams-data.ts` -> folded into `apps/web/src/core/exams/api.ts`
- `apps/web/src/components/exams/preview/exam-preview-page-shell.tsx` -> `apps/web/src/components/exams/preview/page.tsx`
- `apps/web/src/components/exams/preview/exam-preview-data.ts` -> folded into `apps/web/src/core/exams/api.ts`
- `apps/web/src/core/exams/config/index.ts` -> `apps/web/src/core/exams/config.ts`
- Delete `apps/web/src/core/exams/hooks.ts`
- Delete `apps/web/src/components/exams/exams-page-shell.test.mts`
- Delete `apps/web/src/components/exams/preview/exam-preview-page-shell.test.mts`

## Component Layer

The component layer should only render stable UI state:

- `components/exams/page.tsx`
  - Export `ExamsPage`.
  - Own the list page composition.
  - Use `useQuery(examQueryOptions.list(initialFilters))` directly.
  - Build URL query strings and navigate on filter/page changes.
  - Use Zustand only for client-only state such as `activeExamId`.

- `components/exams/filters.tsx`
  - Export `ExamsFilters`.
  - Use TanStack Form for the keyword form.
  - Do not use `useEffect` to reset form state from `defaultValues`.
  - Treat `defaultValues` as initial values.
  - Submit should trim the keyword and reset `pageNo` to `1`.
  - Reset should explicitly reset to an empty keyword and notify the parent.

- `components/exams/results.tsx`
  - Export `ExamsResults`.
  - Include loading, empty, and list rendering states.
  - Do not render raw API error messages.
  - Keep loading/empty helper components at module scope, not inside parent components.

- `components/exams/preview/page.tsx`
  - Export `ExamPreviewPage`.
  - Use `useQuery(examQueryOptions.preview(examId))` directly.
  - Render skeleton while loading.
  - Render empty state when preview data is `null`.
  - Keep start-action feedback local to the component.

## Core Layer

The core layer should own data and domain contracts:

- `core/exams/api.ts`
  - Call `@workspace/api` exam endpoints.
  - Convert unknown API payloads into stable frontend types.
  - Use boundary helpers such as `toText`, `toNumberOrNull`, `toBooleanOrNull`, and `toRecordOrEmpty` only inside this file.
  - Return safe fallbacks instead of leaking raw errors:
    - `fetchExamList` returns `{ items: [], total: 0 }` on failure.
    - `fetchExamPreview` returns `null` on failure.

- `core/exams/config.ts`
  - Export `EXAMS_PAGE_SIZE`, exam type options, and exam status options.
  - May export small label helpers or module-level maps if that keeps component code cleaner.

- `core/exams/queries.ts`
  - Export `examKeys`.
  - Export `examQueryOptions.list(filters)`.
  - Export `examQueryOptions.preview(examId)`.
  - Import API functions from `./api`.

- `core/exams/mutations.ts`
  - Keep exam session and submit mutations.
  - Use explicit cache invalidation through `examKeys`.

- `core/exams/store.ts`
  - Keep only client state.
  - Do not store API list or preview data.

- `core/exams/types.ts`
  - Export `ExamFiltersState`, filter union types, `ExamListItem`, `ExamListResult`, and `ExamPreview`.

- `core/exams/index.ts`
  - Export the domain public surface.
  - Do not reintroduce a `hooks.ts` barrel surface.

## Error Handling

The UI should not show technical details such as network errors, environment variable names, or raw exception messages.

For list data:

- `fetchExamList` catches errors and returns an empty list.
- The list page treats empty results as the normal empty state.

For preview data:

- `fetchExamPreview` catches errors and returns `null`.
- The preview page renders a generic empty/unavailable state.

This intentionally overrides the general "data-driven pages must include error states" guideline for this specific refactor. The product behavior for exams is to avoid exposing infrastructure failures in the student UI and collapse failures into safe unavailable/empty states. The implementation should not preserve a retry/error panel for list or preview API failures in this pass.

The implementation may log nothing. It should not add console logging as a substitute for product error handling.

## Multica-Derived Adjustments

The Multica codebase shows several patterns worth borrowing for this exams refactor:

- Keep route files thin and let the page component own composition.
- Put query keys and `queryOptions(...)` in the domain core, then call `useQuery(...)` directly in the view component.
- Avoid custom hooks when they only wrap `useQuery(...)` without adding meaningful behavior.
- Use direct, named domain files such as `queries.ts`, `mutations.ts`, `store.ts`, `types.ts`, and `config.ts`.
- Keep platform adapters separate from shared/domain code. For this refactor, that means components can use Next routing because they live in the app, but `core/exams` must not import from `next/*` or `components/*`.
- Use module-scope helpers and components instead of defining components inside components.
- Do not copy Multica's larger cross-platform package layout into this project; only borrow the boundary discipline.

## Function Style

Within the modified exams files, use arrow functions consistently:

```ts
const helper = () => {}

export const fetchExamList = async () => {}

const ExamsRoute = async () => {}
export default ExamsRoute
```

This applies to:

- Components.
- Helpers.
- Hooks that remain, such as mutation hooks.
- Next route default exports.

## React and Next Practices

- Do not define React components inside other React components.
- Keep helper components at module scope.
- Do not add `useMemo` or `useCallback` unless there is a concrete rendering reason.
- Keep interaction side effects in event handlers.
- Avoid unnecessary `useEffect`; specifically, do not reset the filters form from `defaultValues` via effect.
- Keep query options in `core/exams/queries.ts` so cache keys remain centralized.
- Components may import `useQuery` directly from `@tanstack/react-query`.

## Testing Policy

Delete the current source-string tests:

- `apps/web/src/components/exams/exams-page-shell.test.mts`
- `apps/web/src/components/exams/preview/exam-preview-page-shell.test.mts`

They are not a good reference style because they assert source text rather than behavior.

This pass does not add replacement tests. This is an explicit scoped exception to the general testing guidance in `AGENTS.md`, approved for this refactor because the current tests are misleading as a reference pattern and the user wants this step focused on structure, naming, and data boundaries. Verification relies on lint/build for this pass.

Future tests, if needed, should target:

- API adapter behavior.
- Query key construction.
- Store behavior.
- Meaningful state branching.

## Acceptance Criteria

- The exams list and preview pages still route correctly from Next route files.
- File names no longer repeat `exams-` inside the `components/exams` directory.
- `shell` is removed from exams component filenames and exported component names.
- `core/exams` no longer imports from `components/exams`.
- Components no longer import `toText`, `toNumberOrNull`, `toBooleanOrNull`, or `toRecordOrEmpty`.
- Components call `useQuery(examQueryOptions.xxx(...))` directly.
- `core/exams/hooks.ts` is deleted.
- Current source-string `.test.mts` files are deleted.
- Modified exams files use arrow functions instead of function declarations.
- UI does not expose raw API error messages or environment variable names.
- List and preview API failures collapse into empty/unavailable states rather than dedicated raw error panels.
- Verification includes at least `pnpm --filter web lint` and `pnpm --filter web build`, unless blocked by pre-existing unrelated failures that are reported precisely.

## Risks

- The current worktree already contains uncommitted exams and React Query migration work. Implementation must preserve those changes and not revert unrelated files.
- Moving files will require updating imports in app routes, components, and tests/scripts.
- Returning empty data on API failure simplifies the UI but can hide operational issues. This is intentional for the product UI, but developer observability may need a separate future strategy.
- Deleting tests reduces test count. This is accepted because the current tests are not behavior-focused and are not intended as a reference style.
