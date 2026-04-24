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

- `src/app/**/page.tsx` files should stay thin. They should connect routes to domain page components.
- Page components in `src/components/<domain>` own page-level layout and compose domain sections.
- Domain logic should not be hidden in route files.
- Prefer small domain components with clear props over large page files that mix data, layout, and helper logic.
- Data-driven pages must render loading, empty, and error states.

## Page Migration Checklist

When migrating or refactoring a student page/domain, use `apps/web/src/components/exams` and `apps/web/src/core/exams` as the structural reference unless the task explicitly says otherwise.

Required for migrated domains:

- Component filenames inside `src/components/<domain>` must not repeat the domain prefix. Prefer `page.tsx`, `filters.tsx`, `results.tsx`, `preview/page.tsx`, and similarly direct names.
- Do not use `shell` in new or migrated page component filenames or exported component names.
- Modified route, page, component, and domain-core files must use arrow functions: `const PageRoute = async () => {}` and `export default PageRoute`.
- Source-string `.test.mts` files must be deleted during migration. Do not add replacement tests unless the task explicitly asks for behavior tests.
- Data adapters, query options, mutations, config, store, and types belong in `src/core/<domain>`.
- Components should call `useQuery(domainQueryOptions.xxx(...))` directly unless a custom hook adds real behavior beyond wrapping React Query.

Before finishing a migrated domain, run these structural checks with the real domain and route names:

```bash
find apps/web/src/components/<domain> -name '*.test.mts'
rg -n 'page-shell|shell' apps/web/src/components/<domain>
rg -n '^function |^export function |export default async function' apps/web/src/components/<domain> apps/web/src/core/<domain> 'apps/web/src/app/(student)/<route>'
```

The expected result for all three checks is no output. If a legacy exception remains, explain why it was intentionally left.

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
- Domain filters and UI states must use semantic constants or enums in route, component, query-key, and store code. If an API requires numeric/string status codes, keep those values behind named enum members instead of repeating raw literals in component logic.

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
- `apps/web/src/components/exams`: exam page and component organization.

These files are not a command to add `.test.mts` for every page. They are references for separation of responsibilities, naming, and migration cleanup.

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
