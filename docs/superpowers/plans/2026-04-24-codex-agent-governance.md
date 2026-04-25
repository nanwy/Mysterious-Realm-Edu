# Codex Agent Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Codex-first governance layer that constrains future AI-generated frontend code through root and app-level `AGENTS.md` files.

**Architecture:** The root `AGENTS.md` becomes the canonical repository contract for Codex. `apps/web/AGENTS.md` and `apps/mobile-web/AGENTS.md` provide app-specific rules while inheriting the root contract. Existing `AGENT.md` becomes a pointer to avoid conflicting sources of truth.

**Tech Stack:** Markdown instructions, Next.js App Router, pnpm monorepo, React Query, Zustand, shadcn/ui, Tailwind semantic tokens.

---

## Source Spec

- Spec: `docs/superpowers/specs/2026-04-24-codex-agent-governance-design.md`
- External reference, frontend-only: `/Users/nanfugongmeiying/Desktop/project/multica/AGENTS.md`
- External reference, frontend-only: `/Users/nanfugongmeiying/Desktop/project/multica/CLAUDE.md`

## Worktree Notes

- The current repository may contain unrelated uncommitted app changes.
- Do not edit or stage unrelated app files.
- Stage only:
  - `AGENTS.md`
  - `AGENT.md`
  - `apps/web/AGENTS.md`
  - `apps/mobile-web/AGENTS.md`

## File Structure

- Create: `AGENTS.md`
  - Canonical Codex entrypoint.
  - Contains global monorepo rules, hard constraints, reference patterns, verification requirements, and Multica adaptation notes.
- Modify: `AGENT.md`
  - Replace the old full rule body with a short compatibility pointer to `AGENTS.md`.
  - This prevents root-level rule drift.
- Modify: `apps/web/AGENTS.md`
  - Keep the existing Next.js version warning.
  - Add Web-specific route, page shell, domain core, React Query, Zustand, UI, testing, and verification rules.
- Modify: `apps/mobile-web/AGENTS.md`
  - Keep the existing Next.js version warning.
  - Add Mobile Web-specific route, reuse, state, UI, and verification rules.

---

### Task 1: Create Root Codex Contract

**Files:**
- Create: `AGENTS.md`

- [ ] **Step 1: Inspect current root guidance**

Run:

```bash
sed -n '1,260p' AGENT.md
sed -n '1,260p' docs/superpowers/specs/2026-04-24-codex-agent-governance-design.md
```

Expected: Read the old root guidance and the approved design before writing the canonical root file.

- [ ] **Step 2: Create root `AGENTS.md`**

Create `AGENTS.md` with this content:

````markdown
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
````

- [ ] **Step 3: Verify root file content**

Run:

```bash
sed -n '1,260p' AGENTS.md
git diff -- AGENTS.md
```

Expected: `AGENTS.md` exists, contains only frontend-relevant governance, and does not include backend or desktop Multica rules.

---

### Task 2: Convert Old Root `AGENT.md` Into a Pointer

**Files:**
- Modify: `AGENT.md`

- [ ] **Step 1: Replace `AGENT.md` with a compatibility pointer**

Replace the whole file with:

```markdown
# AGENT.md

This file is kept as a compatibility pointer.

The canonical Codex/OpenAI-agent instructions for this repository live in:

- `AGENTS.md`

Read `AGENTS.md` first. Nested `AGENTS.md` files in app or package directories may add more specific rules for that subtree.
```

- [ ] **Step 2: Verify no conflicting root rules remain**

Run:

```bash
sed -n '1,80p' AGENT.md
git diff -- AGENT.md
```

Expected: `AGENT.md` is a short pointer only and no longer contains a second full rule set.

- [ ] **Step 3: Commit root governance files**

Run:

```bash
git status --short
git add AGENTS.md AGENT.md
git commit -m "docs: add root codex governance"
```

Expected: Only `AGENTS.md` and `AGENT.md` are staged and committed. Any unrelated app changes remain unstaged.

---

### Task 3: Expand Web App Rules

**Files:**
- Modify: `apps/web/AGENTS.md`

- [ ] **Step 1: Inspect current Web app rules**

Run:

```bash
sed -n '1,220p' apps/web/AGENTS.md
find apps/web/src/core/exams -maxdepth 2 -type f | sort
find apps/web/src/components/exams -maxdepth 2 -type f | sort
```

Expected: The file currently contains the Next.js version warning, and the exam domain/component files are visible as reference areas.

- [ ] **Step 2: Replace `apps/web/AGENTS.md` with Web contract**

Use this content:

````markdown
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code that depends on Next.js behavior. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Web App Rules

These rules apply inside `apps/web`. They extend the root `AGENTS.md`.

## App Role

`apps/web` is the PC student web app. It owns route wiring, PC-specific page composition, and platform behavior for the Web experience.

Before page migration or visual work, read:

- `/Users/nanfugongmeiying/Desktop/project/Mysterious-Realm-Edu/.impeccable.md`
- `/Users/nanfugongmeiying/Desktop/project/Mysterious-Realm-Edu/docs/migration-progress.md`

## Route and Component Responsibilities

- `src/app/**/page.tsx` files should stay thin. They should connect routes to page shell components.
- Page shell components in `src/components/<domain>` own page-level layout and compose domain sections.
- Domain logic should not be hidden in route files.
- Prefer small domain components with clear props over large page files that mix data, layout, and helper logic.
- Data-driven pages must render loading, empty, and error states.

## Domain Core Pattern

Use `apps/web/src/core/exams` as the current reference for Web-only domain separation.

Preferred shape for a Web-only domain:

```text
src/core/<domain>/
  queries.ts
  mutations.ts
  hooks.ts
  store.ts
  index.ts
```

Rules:

- `queries.ts` owns React Query query options, query keys, and server-state reads.
- `mutations.ts` owns mutations and cache invalidation/update behavior.
- `hooks.ts` composes domain queries, mutations, and UI stores.
- `store.ts` owns Zustand client/UI state only.
- `index.ts` exports the public domain surface.

Move reusable API access, types, and normalization toward `packages/api` and `packages/shared` when Mobile Web or another domain needs the same logic.

## State

- React Query owns server state.
- Zustand owns client state only.
- Do not copy fetched API lists or detail records into Zustand.
- Keep filters, selected tabs, drafts, panel state, and modal state in Zustand or component state depending on reuse needs.
- Query keys must include filters, pagination, identifiers, and any other value that affects returned data.

## UI

- Prefer shadcn/ui and `@workspace/ui` before creating local primitives.
- Do not create page-local replacements for common Button, Dialog, Table, Form, Select, Tabs, Tooltip, or Pagination primitives.
- Use semantic tokens and the project visual direction from `.impeccable.md`.
- Avoid hardcoded Tailwind palette classes as the default styling method.
- Keep PC layout distinct from Mobile Web; do not copy mobile layouts into PC pages or PC layouts into mobile pages.

## Reference Files

Use these as current local references:

- `apps/web/src/core/exams`: domain core organization.
- `apps/web/src/components/exams`: exam page shell and component organization.

These files are not a command to add `.test.mts` for every page. They are references for separation of responsibilities.

## Testing

Tests are expected for logic-heavy changes:

- normalization
- filtering
- search
- pagination
- query-key construction
- mutation side effects
- Zustand stores
- meaningful loading/empty/error branching

Tests are optional for thin routes, static layout, and low-risk presentational changes.

## Verification

For Web changes, choose the smallest meaningful check first:

```bash
pnpm --filter web test
pnpm --filter web lint
pnpm --filter web build
```

For docs-only changes in this file, inspect the markdown and run:

```bash
git diff --check
```
````

- [ ] **Step 3: Verify Web rules**

Run:

```bash
sed -n '1,260p' apps/web/AGENTS.md
git diff -- apps/web/AGENTS.md
git diff --check
```

Expected: The Next.js warning remains, Web-specific rules are present, and whitespace checks pass.

- [ ] **Step 4: Commit Web app rules**

Run:

```bash
git status --short
git add apps/web/AGENTS.md
git commit -m "docs(web): add codex app rules"
```

Expected: Only `apps/web/AGENTS.md` is staged and committed for this task. Any unrelated app changes remain unstaged.

---

### Task 4: Expand Mobile Web App Rules

**Files:**
- Modify: `apps/mobile-web/AGENTS.md`

- [ ] **Step 1: Inspect current Mobile Web app rules**

Run:

```bash
sed -n '1,220p' apps/mobile-web/AGENTS.md
find apps/mobile-web/src -maxdepth 3 -type f | sort | sed -n '1,120p'
```

Expected: The file currently contains the Next.js version warning, and the mobile app structure is visible.

- [ ] **Step 2: Replace `apps/mobile-web/AGENTS.md` with Mobile Web contract**

Use this content:

````markdown
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code that depends on Next.js behavior. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Mobile Web App Rules

These rules apply inside `apps/mobile-web`. They extend the root `AGENTS.md`.

## App Role

`apps/mobile-web` is the mobile student web app. It owns mobile route wiring, mobile-specific layout, touch-friendly interaction, and mobile platform behavior.

Before page migration or visual work, read:

- `/Users/nanfugongmeiying/Desktop/project/Mysterious-Realm-Edu/.impeccable.md`
- `/Users/nanfugongmeiying/Desktop/project/Mysterious-Realm-Edu/docs/migration-progress.md`

## Mobile First Responsibilities

- Keep mobile layout and interaction decisions local to this app unless they are truly shared.
- Do not copy full PC page implementations from `apps/web`.
- Reuse shared API clients, types, helpers, and UI primitives when behavior is common.
- Use mobile-specific composition when the layout or interaction differs.
- Data-driven mobile pages must render loading, empty, and error states.

## State

- React Query owns server state.
- Zustand owns client state only.
- Do not copy fetched API data into Zustand.
- Mobile navigation state, selected tabs, filters, drafts, and panel state may use Zustand when shared across components.
- Component-local state is fine for one-off temporary UI.

## API and Shared Logic

- Shared API access belongs in `packages/api`.
- Shared types, constants, and pure helpers belong in `packages/shared`.
- If a Web-only domain in `apps/web/src/core/<domain>` becomes needed here, extract the reusable parts instead of importing Web app internals.
- Do not import from `apps/web`.

## UI

- Prefer shadcn/ui and `@workspace/ui` before creating local primitives.
- Do not create page-local replacements for common Button, Dialog, Sheet, Drawer, Form, Select, Tabs, Tooltip, or Pagination primitives.
- Use semantic tokens and the project visual direction from `.impeccable.md`.
- Avoid hardcoded Tailwind palette classes as the default styling method.
- Design for touch targets, narrow width, readable truncation, and controlled scrolling.

## Testing

Tests are expected for logic-heavy changes:

- normalization
- filtering
- search
- pagination
- query-key construction
- mutation side effects
- Zustand stores
- meaningful loading/empty/error branching

Tests are optional for thin routes, static layout, and low-risk presentational changes.

## Verification

For Mobile Web changes, choose the smallest meaningful check first:

```bash
pnpm --filter mobile-web lint
pnpm --filter mobile-web build
```

For docs-only changes in this file, inspect the markdown and run:

```bash
git diff --check
```
````

- [ ] **Step 3: Verify Mobile Web rules**

Run:

```bash
sed -n '1,260p' apps/mobile-web/AGENTS.md
git diff -- apps/mobile-web/AGENTS.md
git diff --check
```

Expected: The Next.js warning remains, Mobile Web-specific rules are present, and whitespace checks pass.

- [ ] **Step 4: Commit Mobile Web app rules**

Run:

```bash
git status --short
git add apps/mobile-web/AGENTS.md
git commit -m "docs(mobile-web): add codex app rules"
```

Expected: Only `apps/mobile-web/AGENTS.md` is staged and committed for this task. Any unrelated app changes remain unstaged.

---

### Task 5: Final Governance Verification

**Files:**
- Verify: `AGENTS.md`
- Verify: `AGENT.md`
- Verify: `apps/web/AGENTS.md`
- Verify: `apps/mobile-web/AGENTS.md`

- [ ] **Step 1: Verify expected files changed**

Run:

```bash
git status --short
```

Expected: No governance files are unstaged. Existing unrelated app changes may still appear; do not stage or revert them.

- [ ] **Step 2: Inspect final committed governance content**

Run:

```bash
sed -n '1,260p' AGENTS.md
sed -n '1,80p' AGENT.md
sed -n '1,260p' apps/web/AGENTS.md
sed -n '1,260p' apps/mobile-web/AGENTS.md
```

Expected:

- Root `AGENTS.md` is canonical.
- `AGENT.md` points to `AGENTS.md`.
- Web and Mobile Web files preserve the Next.js warning.
- React Query, Zustand, shadcn/ui, API boundaries, file responsibilities, reference patterns, testing-by-risk, and verification are all covered.

- [ ] **Step 3: Run docs-safe whitespace verification**

Run:

```bash
git diff --check HEAD~3..HEAD
```

Expected: No whitespace errors.

- [ ] **Step 4: Confirm commit scope**

Run:

```bash
git show --stat --oneline HEAD~3..HEAD
```

Expected: The recent implementation commits only include governance markdown files.

- [ ] **Step 5: Report result**

Final report should include:

- Files changed.
- Why `AGENT.md` was reduced to a pointer.
- How the new rules handle React Query, Zustand, shadcn/ui, API boundaries, and reference patterns.
- Verification command and result.
- Note that unrelated pre-existing app changes were not staged or modified.
