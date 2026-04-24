# AGENTS.md

This is the canonical Codex/OpenAI-agent contract for this repository.

## Project

This repository is the Yunxuekao student-facing frontend monorepo. The current work is migrating the old Vue student product into a Next.js monorepo while preserving room for Web, Mobile Web, and shared frontend packages.

Primary areas:

- `apps/web`: PC student web app, Next.js App Router.
- `apps/mobile-web`: mobile student web app, Next.js App Router.
- `packages/ui`: shared UI primitives and shared visual foundation. No business logic.
- `packages/api`: shared API clients and endpoint access.
- `packages/shared`: shared types, constants, and pure helpers.
- `packages/motion`: shared motion primitives.

Before page migration or visual work, read:

- `.impeccable.md`
- `docs/migration-progress.md`

## Rule Priority

Follow this order when rules conflict:

1. Task completion: code builds, checks pass, behavior works.
2. This `AGENTS.md` and the closest nested `AGENTS.md`.
3. Existing project patterns that are marked as reference patterns.
4. User instructions.

Historical generated code is not automatically a pattern to copy.

## Hard Architecture Rules

### Server State and Client State

- React Query owns server state: API data, lists, details, pagination results, cache freshness, mutations, and invalidation.
- Zustand owns client state only: filters, drafts, selected tabs, panel state, modal state, temporary UI state, and small user preferences.
- Never copy API data into Zustand as a second source of truth.
- Query keys must include the domain identifiers, filter values, and pagination values that affect returned data.
- Mutations must deliberately invalidate or update the relevant React Query cache.

### API and Domain Logic

- Do not put scattered `fetch` calls, URL construction, response normalization, or cross-page domain helpers in page components.
- New shared API clients belong in `packages/api`.
- Shared types, constants, and pure helpers belong in `packages/shared`.
- Existing app-local domain core folders, such as `apps/web/src/core/exams`, may remain while a domain is Web-only.
- When Web and Mobile both need the same domain behavior, move reusable API access, types, and normalization toward `packages/api` and `packages/shared`.
- Do not duplicate common `toXxx`, `normalizeXxx`, `parseXxx`, filtering, or pagination helpers across pages.

### Package Boundaries

- `packages/ui` must stay presentation-focused and must not import business API clients or domain stores.
- `packages/api` must not contain page layout or component logic.
- `packages/shared` must stay framework-light: types, constants, and pure helpers.
- `packages/motion` must expose reusable animation primitives, not page-specific choreography.
- App directories own route wiring and platform-specific behavior.

### UI and Styling

- Prefer shadcn/ui and `packages/ui` for base UI primitives.
- Do not recreate common Button, Dialog, Table, Form, Select, Tabs, Tooltip, or Pagination primitives inside page folders.
- Use semantic design tokens as the normal styling path.
- Avoid hardcoded Tailwind palette classes as a default styling strategy.
- New visual work must follow `.impeccable.md`.
- Data-driven pages must include loading, empty, and error states.

### File Responsibilities

- Route files should be thin wiring files.
- Page shell components should compose domain sections and own page-level layout.
- Business components should receive data and callbacks through clear props.
- Shared UI components must not depend on app routes, business API clients, or domain stores.
- Shared logic belongs in the narrowest reusable package or domain folder that matches its audience.

## Reference Patterns

For Web page or domain work, inspect these first:

- `apps/web/src/core/exams`: domain separation, query/mutation/store organization.
- `apps/web/src/components/exams`: page shell and component organization.

These are architecture references, not a mandate that every page must have the same file count or the same number of tests.

Suggested domain shape:

```text
domain/
  queries.ts      # React Query options, query keys, and server-state reads
  mutations.ts    # Mutations and explicit cache invalidation/update behavior
  hooks.ts        # Domain hooks composed from queries, mutations, and UI stores
  store.ts        # Zustand client/UI state only
  index.ts        # Public exports for the domain
```

Do:

- Keep API data in React Query.
- Include filters and pagination in query keys.
- Keep Zustand stores limited to drafts, filters, selections, and view state.
- Move reusable API, types, and helpers to packages when another app needs them.
- Use semantic domain constants or enums for UI state and filters. If backend numeric/string codes must be the actual values, wrap them in named enums such as `EXAM_STATUS.IN_PROGRESS = "0"`; do not spread magic values such as `"0"`, `"1"`, or `"2"` through components.

Do not:

- Copy fetched lists into Zustand.
- Call `fetch` directly from page components.
- Duplicate normalize helpers across pages.
- Create one-off UI primitives when shadcn/ui or `packages/ui` already covers the need.

## Testing Rules

Do not add tests mechanically to every page.

Tests are expected when changing:

- Data transformation.
- Normalization.
- Filtering.
- Search behavior.
- Pagination.
- Query-key construction.
- Mutation side effects.
- Zustand store behavior.
- Loading, empty, and error branching with meaningful logic.
- Shared package logic.

Tests are optional for:

- Static layout.
- Pure presentational components.
- Thin route files.
- Low-risk visual-only adjustments.

## Refactoring Rules

- Do not perform broad cleanup just because old generated code looks messy.
- When touching an old page, move the edited area toward the current reference pattern.
- Keep unrelated old code stable unless it blocks the current task.
- Extract shared logic when multiple apps or domains need the same behavior.
- Avoid premature shared abstractions for a single page.

## Verification

Every code change must include a relevant verification command or a clear explanation for why verification could not run.

Use the smallest meaningful verification first:

- Logic or store change: targeted test.
- Structural TypeScript change: `pnpm lint` or a package-specific typecheck if available.
- Route or framework-sensitive change: relevant app build.
- Docs-only agent rule change: inspect the changed markdown and run `git diff --check`.

Failing verification is not complete. Fix failures or report the blocker precisely.

## External Reference

The Multica project at `/Users/nanfugongmeiying/Desktop/project/multica` is a reference for frontend governance style only.

Borrow these ideas:

- Concise `AGENTS.md` entrypoint.
- Strict state ownership.
- Explicit package boundaries.
- Shared UI and semantic tokens.
- Tests near the logic they validate.
- Verification after edits.

Do not copy Multica backend, desktop, Go, release, or exact directory rules into this project.
