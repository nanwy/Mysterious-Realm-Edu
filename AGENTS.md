# AGENTS.md

This is the canonical Codex/OpenAI-agent contract for this repository.

## Project

This repository is the Yunxuekao student-facing frontend monorepo. The current work is migrating the old Vue student product into a Next.js monorepo while preserving room for Web, Mobile Web, and shared frontend packages.

Primary modules:

- `apps/web`: PC student web app, Next.js App Router.
- `apps/mobile-web`: mobile student web app, Next.js App Router. Do not add mobile work unless the task explicitly asks for it.
- `packages/ui`: shared UI primitives and shared visual foundation. No business logic.
- `packages/api`: shared endpoint adapters and endpoint access.
- `packages/shared`: shared types, constants, and pure helpers.
- `packages/motion`: shared motion primitives.

Before page migration or visual work, read:

- `.impeccable.md`
- `docs/migration-progress.md`

## Rule Priority

Follow this order when rules conflict:

1. Task completion: code builds, checks pass, behavior works.
2. This `AGENTS.md` and the closest nested `AGENTS.md`.
3. Existing project patterns that are marked as reference modules.
4. User instructions.

Historical generated code is not automatically a pattern to copy.

## Architecture Language

- **Module**: anything with an interface and an implementation.
- **Interface**: everything a caller must know to use the module correctly.
- **Implementation**: code hidden behind the interface.
- **Seam**: where behavior can vary without editing the caller.
- **Adapter**: a concrete thing plugged into a seam.
- **Depth**: useful behavior behind a small interface.
- **Leverage**: what callers get from depth.
- **Locality**: changes, bugs, knowledge, and verification stay near the owning module.

Use these terms instead of loose "component", "service", "API", or "boundary" when describing architecture. Use "React component" only for actual React UI components, and use "endpoint access" when referring to backend HTTP access.

Prefer deep modules and clear interfaces. Use the deletion test: if deleting a module only moves identical code into callers, the module was not earning its keep.

## Hard Architecture Rules

### Server State and Client State

- React Query owns server state: endpoint data, lists, details, pagination results, cache freshness, mutations, and invalidation.
- Zustand owns client state only: filters, drafts, selected tabs, panel state, modal state, temporary UI state, and small user preferences.
- Complex client workflows with shared draft/UI state across sibling React components should use a Zustand domain store plus a domain controller hook instead of scattering `useState` and prop drilling through the page.
- Never copy endpoint data into Zustand as a second source of truth.
- Query keys must include the domain identifiers, filter values, and pagination values that affect returned data.
- Mutations must deliberately invalidate or update the relevant React Query cache.

### Endpoint and Domain Logic

- Do not put scattered `fetch` calls, URL construction, response normalization, or cross-page domain helpers in page modules.
- New shared endpoint adapters belong in `packages/api`.
- Shared types, constants, and pure helpers belong in `packages/shared`.
- Existing app-local domain modules, such as `apps/web/src/core/exams`, may remain while a domain is Web-only.
- When Web and Mobile both need the same domain behavior, move reusable endpoint access, types, and normalization toward `packages/api` and `packages/shared`.
- Do not duplicate common `toXxx`, `normalizeXxx`, `parseXxx`, filtering, or pagination helpers across page modules.

### Endpoint Package Rules

- New endpoint access must live in `packages/api`.
- Endpoint modules must expose a `createXxxApi(client)` factory.
- Endpoint modules must not instantiate their own client for primary endpoint definitions.
- Endpoint modules must not import React, Next.js, Zustand, UI packages, or Web domain implementation.
- Endpoint modules must use shared query helpers for GET parameters.
- Do not hand-build query strings such as `?id=${id}`.
- React Query `queryOptions` and mutations belong in `apps/web/src/core/<domain>`, not in `packages/api`.
- Page modules must not call `@workspace/api` directly for domain data.
- Normalize backend payloads in Web domain modules unless the transformation is a reusable protocol concern.

### Package Modules

- `packages/ui` must stay presentation-focused and must not import business endpoint adapters or domain stores.
- `packages/api` must not contain page layout or React component implementation.
- `packages/shared` must stay framework-light: types, constants, and pure helpers.
- `packages/motion` must expose reusable animation primitives, not page-specific choreography.
- App directories own route wiring and platform-specific behavior.

Create a seam only when behavior actually varies. One adapter means a hypothetical seam; two adapters means a real one.

### UI and Styling

- Prefer shadcn/ui and `packages/ui` for base UI primitives.
- Do not recreate common Button, Dialog, Table, Form, Select, Tabs, Tooltip, or Pagination primitives inside page folders.
- Use semantic design tokens as the normal styling path.
- Avoid hardcoded Tailwind palette classes as a default styling strategy.
- New visual work must follow `.impeccable.md`.
- Data-driven pages must include loading, empty, and error states.

### File Responsibilities

- Route files should be thin wiring modules.
- Page modules should compose domain sections and own page-level layout.
- Business React components should receive data and callbacks through clear props.
- Do not explode one cohesive domain object or controller into a long list of sibling props. Prefer passing the cohesive object or grouped props, then destructure inside the receiving React component.
- Use destructuring at module interfaces to make required fields explicit, but avoid destructuring so early that the caller becomes noisy or repeats the same object prefix across many props.
- Shared UI modules must not depend on app routes, business endpoint adapters, or domain stores.
- Shared logic belongs in the narrowest reusable package or domain module that matches its audience.

## Reference Patterns

For Web page or domain work, inspect these first:

- `apps/web/src/core/exams`: domain separation, query/mutation/store organization.
- `apps/web/src/components/exams`: page and React component organization.

These are architecture reference modules, not a mandate that every page must have the same file count or the same number of tests.

Suggested domain shape:

```text
domain/
  queries.ts      # React Query options, query keys, and server-state reads
  mutations.ts    # Mutations and explicit cache invalidation/update behavior
  hooks.ts        # Domain hooks composed from queries, mutations, and UI stores
  store.ts        # Zustand client/UI state only
  index.ts        # Public exports for the domain module
```

Do:

- Keep endpoint data in React Query.
- Include filters and pagination in query keys.
- Keep Zustand stores limited to drafts, filters, selections, and view state.
- Move reusable endpoint access, types, and helpers to packages when another app needs them.
- Use semantic domain constants or enums for UI state and filters. If backend numeric/string codes must be the actual values, wrap them in named enums such as `EXAM_STATUS.IN_PROGRESS = "0"`; do not spread magic values such as `"0"`, `"1"`, or `"2"` through React components.

Do not:

- Copy fetched lists into Zustand.
- Call `fetch` directly from page modules.
- Duplicate normalize helpers across pages.
- Create one-off UI primitives when shadcn/ui or `packages/ui` already covers the need.

## Testing Rules

The module interface is the test surface. Test through the same interface callers use.

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
- Pure presentational React components.
- Thin route files.
- Low-risk visual-only adjustments.

## Refactoring Rules

- Do not perform broad cleanup just because old generated code looks messy.
- When touching an old page, move the edited area toward the current reference module.
- Keep unrelated old code stable unless it blocks the current task.
- Extract shared logic when multiple apps or domain modules need the same behavior.
- Avoid premature shared seams for a single page.

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
- Explicit package interfaces.
- Shared UI and semantic tokens.
- Tests near the logic they validate.
- Verification after edits.

Do not copy Multica backend, desktop, Go, release, or exact directory rules into this project.
