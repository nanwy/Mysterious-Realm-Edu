# Codex Agent Governance Design

**Date:** 2026-04-24

## Background

The project is a Next.js monorepo for the Yunxuekao student-facing product migration. It already has useful guidance in `AGENT.md`, `apps/web/AGENTS.md`, `apps/mobile-web/AGENTS.md`, `.impeccable.md`, and `docs/migration-progress.md`, but the guidance is split across files and is not yet strong enough to constrain AI-generated code.

The current codebase also has mixed-quality history. Some newer exam-domain code has been refactored toward clearer domain boundaries, while older pages were generated before the project had stable rules. The governance system must therefore avoid telling agents to imitate the whole repository blindly.

The user wants a Codex/OpenAI-agent-first rule system. Other AI tools are out of scope for this first pass.

## Goals

- Create a layered set of Codex-readable rules for the monorepo.
- Make architectural constraints explicit enough that agents stop inventing parallel patterns.
- Preserve flexibility for implementation details that should remain judgment-based.
- Give agents concrete local reference patterns where good project-specific examples exist.
- Borrow only frontend-relevant governance ideas from `/Users/nanfugongmeiying/Desktop/project/multica`.
- Avoid forcing tests on every page when a page is mostly static or presentational.

## Non-Goals

- Do not refactor application code in this phase.
- Do not create compatibility files for every AI tool.
- Do not migrate the project to Multica's exact directory structure.
- Do not enforce all conventions through automation in the first implementation plan.
- Do not require every page component to have a `.test.mts` file.

## Source References

### Current Project

- `AGENT.md`: existing project-level guidance and migration rules.
- `apps/web/AGENTS.md`: current app-level Next.js warning.
- `apps/mobile-web/AGENTS.md`: current app-level Next.js warning.
- `.impeccable.md`: product and visual direction.
- `docs/migration-progress.md`: migration status and current priorities.
- `apps/web/src/core/exams`: current domain-core reference pattern.
- `apps/web/src/components/exams`: current exam page and component reference area.

### External Reference

- `/Users/nanfugongmeiying/Desktop/project/multica/AGENTS.md`
- `/Users/nanfugongmeiying/Desktop/project/multica/CLAUDE.md`

Only the frontend governance principles from Multica should be reused: concise agent entrypoint, hard state split, package boundaries, shared UI discipline, semantic token usage, testing-by-risk, and verification loop. Backend, desktop, Go, release, and Multica-specific product rules are out of scope.

## Recommended Approach

Use a layered `AGENTS.md` system:

1. Root-level contract for rules that apply everywhere.
2. App-level contracts for `apps/web` and `apps/mobile-web`.
3. Package-level contracts later, only when shared packages grow enough to need local rules.

This is preferable to a single large root file because Codex can read the closest `AGENTS.md` while working in a subtree, and it keeps app-specific concerns close to the code they govern. It is also safer than immediately adding strict automation because the repository has existing generated code and active uncommitted work.

## File Design

### Root `AGENTS.md`

Create a new root `AGENTS.md` as the canonical Codex entrypoint.

Responsibilities:

- State that this repository is a frontend monorepo for the Yunxuekao migration.
- Point agents to `.impeccable.md` and `docs/migration-progress.md` before page work.
- Define hard architecture rules.
- Define reference-pattern rules.
- Define verification and delivery requirements.
- Clarify that existing historical code is not automatically a pattern to imitate.

The existing `AGENT.md` should not remain a conflicting second source of truth. The implementation plan should decide whether to convert it into a pointer to `AGENTS.md` or fold its current useful content into `AGENTS.md` and leave a short compatibility note.

### `apps/web/AGENTS.md`

Expand this file from a Next.js warning into the Web app contract.

Responsibilities:

- Preserve the existing warning to read `node_modules/next/dist/docs/` for this Next.js version when touching framework-sensitive code.
- Define App Router page responsibilities.
- Define server/client component boundaries.
- Define Web-specific page shell, route, domain core, and component expectations.
- Identify `apps/web/src/core/exams` and `apps/web/src/components/exams` as current reference areas for domain separation and page organization.
- Explain that exam files are reference patterns for architecture, not a mandate that every page gets the same number or shape of tests.

### `apps/mobile-web/AGENTS.md`

Expand this file into the Mobile Web app contract.

Responsibilities:

- Preserve the Next.js version warning.
- Keep mobile-specific UI and routing differences local.
- Reuse shared business logic and UI where practical.
- Avoid copying entire PC page implementations into mobile.
- Use props, slots, or shared helpers when logic is common but layout differs.

### Future Package `AGENTS.md` Files

Do not add these in the first implementation unless needed by the actual edit scope:

- `packages/ui/AGENTS.md`
- `packages/api/AGENTS.md`
- `packages/shared/AGENTS.md`
- `packages/motion/AGENTS.md`

The root contract should define their boundaries first. Package-level files can be added when those packages accumulate enough code that local instructions improve agent behavior.

## Hard Rules

These rules should use "must", "never", or equivalent strict wording.

### State Management

- React Query owns server state: API data, lists, details, pagination results, cache freshness, mutations, and invalidation.
- Zustand owns client state only: filters, drafts, selected tabs, panel state, modal state, temporary UI state, and small user preferences.
- API data must not be copied into Zustand as a second source of truth.
- Query keys must include the domain identifiers and filter/page values that affect the returned data.
- Mutations must invalidate or update the relevant React Query cache deliberately.

### API and Domain Logic

- Page components must not contain scattered `fetch` calls, URL construction, response normalization, or cross-page domain helpers.
- New cross-endpoint API clients should live in `packages/api`.
- Existing app-local domain-core patterns, such as `apps/web/src/core/exams`, may remain while a domain is Web-only.
- When a domain becomes shared by Web and Mobile, reusable API access, types, and normalization should move toward `packages/api` and `packages/shared`.
- Common `toXxx`, `normalizeXxx`, `parseXxx`, filtering, and pagination helpers must not be duplicated across pages.

### UI and Styling

- Prefer shadcn/ui and `packages/ui` for base UI primitives.
- Do not recreate common Button, Dialog, Table, Form, Select, Tabs, Tooltip, or Pagination primitives inside page folders.
- Use semantic design tokens instead of hardcoded Tailwind color palettes as the normal styling path.
- New visual work must follow `.impeccable.md`.
- Loading, empty, and error states are required for data-driven pages.

### File Responsibilities

- Route files should be thin wiring files.
- Page shell components should compose domain sections and own page-level layout.
- Business components should receive data and callbacks through clear props.
- Shared UI components must not depend on app routes, business API clients, or domain stores.
- Shared logic belongs in the narrowest reusable package or domain folder that matches its audience.

### Verification

- Every code change must include a relevant verification command or a clear explanation for why verification could not run.
- The verification scope should match the risk of the change: targeted tests for logic, lint/typecheck for structural changes, build for route or framework-sensitive changes.
- Failing verification is not a completed task; agents must fix failures or report the blocker precisely.

## Guidance Rules

These rules should guide agent judgment without turning every choice into a blocker.

### Testing by Risk

Do not require a `.test.mts` file for every page.

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
- Visual-only adjustments with low behavioral risk.

### Refactoring Scope

- Do not perform broad cleanup just because old generated code looks messy.
- When touching an old page, move the edited area toward the new pattern.
- Keep unrelated old code stable unless it blocks the current task.

### Shared Extraction

- Extract shared logic when two apps or multiple domains need the same behavior.
- Avoid premature shared abstractions for a single page.
- Prefer extracting logic before extracting visual style.

## Reference Pattern Mechanism

The rule files should explicitly teach Codex how to choose examples:

1. Read the root `AGENTS.md`.
2. Read the closest app or package `AGENTS.md`.
3. Read `.impeccable.md` and `docs/migration-progress.md` before page migration work.
4. For Web page/domain work, inspect `apps/web/src/core/exams` as the first local reference for domain separation.
5. Inspect `apps/web/src/components/exams` as a page-organization reference when the task resembles the exam area.
6. Treat older generated pages as functional history, not as style authority.
7. If rules and examples conflict, hard rules win over examples, and current project rules win over external Multica references.

The suggested domain pattern is:

```text
domain/
  queries.ts      # React Query options, query keys, and server-state reads
  mutations.ts    # Mutations and explicit cache invalidation/update behavior
  hooks.ts        # Domain hooks composed from queries, mutations, and UI stores
  store.ts        # Zustand client/UI state only
  index.ts        # Public exports for the domain
```

The rules should include compact examples of the intended behavior:

```text
Do:
- keep API data in React Query
- include filters and pagination in query keys
- keep Zustand stores limited to drafts, filters, selections, and view state
- move reusable API/types/helpers to packages when another app needs them

Do not:
- copy fetched lists into Zustand
- call fetch directly from page components
- duplicate normalize helpers across pages
- create one-off UI primitives when shadcn/ui or packages/ui already covers the need
```

## Multica Adaptation

Multica's frontend governance should influence the project in these ways:

- Use `AGENTS.md` as a concise entrypoint.
- Keep state ownership strict.
- Make package boundaries explicit.
- Keep platform APIs out of shared code.
- Use shared UI and semantic tokens.
- Place tests near the code they validate.
- Require verification after edits.

Multica's exact package names and cross-platform desktop rules should not be copied. This project should map the ideas to its actual structure:

- `packages/api` for shared API access.
- `packages/shared` for shared types, constants, and helpers.
- `packages/ui` for pure UI primitives.
- `packages/motion` for shared motion primitives.
- `apps/web/src/core/<domain>` for Web-only domain organization during migration.
- App directories for route wiring and platform-specific behavior.

## Automation Strategy

The first implementation should focus on rule files, not a full enforcement suite.

The design should still leave room for a later automation pass:

- Add or standardize `pnpm typecheck`.
- Consider package-level lint rules for import boundaries.
- Extend test scripts as packages mature.
- Add focused checks for duplicated helpers or forbidden imports only after the target structure is stable.

This staged approach avoids letting historical code block the first useful governance step.

## Acceptance Criteria

- A root `AGENTS.md` exists and is the canonical Codex entrypoint.
- `apps/web/AGENTS.md` contains Web-specific implementation rules while preserving the Next.js warning.
- `apps/mobile-web/AGENTS.md` contains Mobile Web-specific implementation rules while preserving the Next.js warning.
- The rules clearly distinguish hard constraints from guidance.
- The rules define React Query, Zustand, shadcn/ui, API, file-boundary, and verification expectations.
- The rules include reference-pattern guidance for `apps/web/src/core/exams` and the exams components without requiring tests for every page.
- The rules mention the Multica reference only as inspiration for frontend governance, not as a structure to clone exactly.
- No application feature code is changed by the first implementation.

## Risks

- If the root file becomes too long, agents may ignore important details. Keep it concise and move app-specific content into app-level files.
- If rules overfit to `exams`, agents may force every domain into the same shape. The rule text must describe it as a reference pattern, not a universal file-count mandate.
- If verification requirements are too strict before scripts are standardized, agents may spend time fixing unrelated historical failures. Verification should be relevant and scoped until automation is improved.
- If `AGENT.md` and `AGENTS.md` both contain full rules, future agents may receive conflicting instructions. The implementation must choose a single canonical source.
