<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code that depends on Next.js behavior. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Mobile Web App Rules

These rules apply inside `apps/mobile-web`. They extend the root `AGENTS.md`. Mobile Web is not an active target right now; do not add mobile work unless the task explicitly asks for it.

## App Role

`apps/mobile-web` is the mobile student web app. It owns mobile route wiring, mobile-specific layout, touch-friendly interaction, and mobile platform behavior.

Before page migration or visual work, read:

- `./impeccable.md`
- `./docs/migration-progress.md`

## Mobile First Responsibilities

- Keep mobile layout and interaction decisions local to this app unless they are truly shared.
- Do not copy full PC page implementation from `apps/web`.
- Reuse shared endpoint adapters, types, helpers, and UI primitives when behavior is common.
- Use mobile-specific composition when the layout or interaction differs.
- Data-driven mobile pages must render loading, empty, and error states.

## State

Follow the root state ownership rules. Mobile-specific reminder:

- React Query owns server state.
- Zustand owns client state only.
- Do not copy fetched endpoint data into Zustand.
- Mobile navigation state, selected tabs, filters, drafts, and panel state may use Zustand when shared across React components.
- Local React component state is fine for one-off temporary UI.

## Endpoint and Shared Logic

- Shared endpoint access belongs in `packages/api`.
- Shared types, constants, and pure helpers belong in `packages/shared`.
- If a Web-only domain module in `apps/web/src/core/<domain>` becomes needed here, extract the reusable implementation instead of importing Web app internals.
- Do not import from `apps/web`.

## UI

- Prefer shadcn/ui and `@workspace/ui` before creating local primitives.
- Do not create page-local replacements for common Button, Dialog, Sheet, Drawer, Form, Select, Tabs, Tooltip, or Pagination primitives.
- Use semantic tokens and the project visual direction from `.impeccable.md`.
- Avoid hardcoded Tailwind palette classes as the default styling method.
- Design for touch targets, narrow width, readable truncation, and controlled scrolling.

## Testing

The module interface is the test surface. Tests should cross the same interface callers use.

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
git diff --check -- apps/mobile-web/AGENTS.md
```
