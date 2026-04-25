# Online Exam Zustand State Design

**Date:** 2026-04-25

## Background

The online exam page currently keeps answer drafts, current question index, and action feedback in component-local state. That made `apps/web/src/components/exams/online/page.tsx` responsible for data fetching, answer mutation wiring, draft updates, navigation, derived progress, and page layout at the same time.

This also creates wide prop surfaces. `OnlineQuestionPanel` receives many individual values and callbacks even though they are all part of one online-answering workflow. The issue is not only prop count; it is that workflow state and workflow actions are not clearly bounded.

The page already caches answer progress to the backend through `useCacheExamAnswerMutation` whenever an answer changes. Because progress is saved remotely, the frontend store does not need local persistence. React Query should remain the owner of server state, and Zustand should only own the active client-side answering draft and UI state.

## Goals

- Move online exam client state from `page.tsx` into the exams Zustand store.
- Keep React Query as the single owner of fetched session, questions, answer groups, and backend cached answers.
- Keep Zustand limited to current answering draft and UI state.
- Reduce `OnlineQuestionPanel` prop sprawl by grouping workflow props.
- Keep online subcomponents mostly presentational and free of direct store coupling.
- Preserve realtime backend answer caching behavior.
- Avoid localStorage or other frontend persistence for answer progress.

## Non-Goals

- Do not move fetched `ExamOnlineSession`, questions, or answer groups into Zustand.
- Do not add local persistence for answers.
- Do not change the backend cache or submit API behavior.
- Do not refactor unrelated exams list or preview pages.
- Do not introduce a generic global exam runner abstraction outside the current online exam page.

## Source References

- `AGENTS.md`
- `apps/web/AGENTS.md`
- `apps/web/src/components/exams/online/page.tsx`
- `apps/web/src/components/exams/online/question-panel.tsx`
- `apps/web/src/components/exams/online/answer-card.tsx`
- `apps/web/src/components/exams/online/status-panel.tsx`
- `apps/web/src/core/exams/store.ts`
- `apps/web/src/core/exams/mutations.ts`
- `apps/web/src/core/exams/online.ts`
- `apps/web/src/core/exams/types.ts`

## Recommended Approach

Use a domain-specific online exam slice inside `apps/web/src/core/exams/store.ts` and a controller hook in `apps/web/src/core/exams/hooks.ts`.

React Query continues to fetch `ExamOnlineSession` through `examQueryOptions.online(examId)`. Once a session is available, the controller hydrates Zustand with only `userExamId` and `cachedAnswers`. The hydration action is idempotent by `userExamId`; if the current store already represents that session, it should not overwrite in-progress draft state.

Zustand owns:

- `online.userExamId`
- `online.currentIndex`
- `online.answers`
- `online.actionMessage`

Zustand does not own:

- `ExamOnlineSession`
- `questions`
- `answerGroups`
- React Query loading, error, or mutation state
- persisted local copies of backend data

## Alternatives Considered

### Keep Local Component State

This is the smallest change, but it leaves `page.tsx` as a workflow controller and keeps the online question panel prop surface wide. It also conflicts with the project rule that Zustand should own drafts and temporary UI state.

### Put Store Access Directly Into Subcomponents

This would reduce props quickly, but it would couple presentational components to the domain store and make them harder to reuse or test. It also spreads workflow decisions across several components instead of centralizing them.

### Recommended: Store Slice plus Controller Hook

The store owns client draft state, while the controller hook composes store actions, React Query mutations, and derived view state. Page composition stays thinner, subcomponents remain presentational, and server/client state ownership stays explicit.

## Store Design

`core/exams/store.ts` should expand the current store instead of creating a separate competing store. The current `activeExamId` client state may remain.

The online slice should expose actions similar to:

- `hydrateOnlineSession(userExamId, cachedAnswers)`
- `resetOnlineSession()`
- `setOnlineCurrentIndex(index)`
- `setOnlineAnswers(answers)`
- `setOnlineActionMessage(message)`

The hydrate action should:

- Set `userExamId` to the incoming session id.
- Set `answers` from `cachedAnswers`.
- Reset `currentIndex` to `0`.
- Clear `actionMessage`.
- Skip all writes when the incoming `userExamId` matches the store's current `userExamId`.

The reset action should clear online draft state when the page unmounts or after a successful submit. Since answers are cached to the backend in real time, reset-on-unmount is acceptable.

## Controller Hook

Add a focused hook such as `useOnlineExamController(session)` in `apps/web/src/core/exams/hooks.ts`.

The hook should:

- Hydrate the online store when `session.userExamId` changes.
- Read current index, answers, and action message from Zustand.
- Use `useCacheExamAnswerMutation` for answer changes.
- Use `useSubmitExamMutation` for final submission.
- Derive `questions`, `currentQuestion`, `answerForCurrent`, `answeredCount`, and `progress`.
- Expose workflow actions for selecting questions, moving between questions, updating answers, and submitting.

The hook may use a `useEffect` for store hydration. This is not the banned "props to local state mirror" pattern because the effect initializes an external client draft store from a backend recovery point and is keyed by `userExamId`.

## Answer Update Flow

Answer updates should be computed before mutation calls:

1. Build the next `ExamOnlineAnswerDraft[]`.
2. Write that next array into Zustand.
3. Call `cacheMutation.mutate({ userExamId, answers: nextAnswers })`.
4. Set action feedback to a concise "saved" message.

Pure answer helpers should live in `core/exams/online.ts` when they are reusable or complex enough to test. This avoids burying answer transformation logic inside JSX files.

## Component Design

`components/exams/online/page.tsx` should become page composition:

- Fetch the session with React Query.
- Render loading and empty states.
- Render the online workspace once a session exists.
- Let the controller hook provide view state and actions.

`OnlineQuestionPanel` should remain presentational but receive grouped props, for example:

- `question`
- `answer`
- `navigation`
- `answerActions`
- `submitAction`

`OnlineAnswerCard` can keep receiving the values it needs, but summary-like values should be grouped if that improves readability.

`OnlineStatusPanel` already has a small enough prop surface and does not need store access.

## Error Handling

Server read errors stay with React Query and the existing loading/empty page states.

Answer cache mutation failures should not create a local persistence fallback in this pass. The UI may keep the current draft in memory while the page is mounted, but recovery after navigation remains backend-owned. If cache failure handling becomes product-critical later, it should be designed explicitly rather than hidden in localStorage.

Submit errors should keep using the existing mutation error path or the current generic action feedback pattern. Successful submit should reset the online store after the mutation resolves.

## Testing and Verification

Add or update targeted tests only where logic changes:

- Store hydration should not overwrite state for the same `userExamId`.
- Store hydration should reset state for a different `userExamId`.
- Pure answer update helpers should preserve existing answer behavior.

Run the smallest meaningful verification after implementation:

- Targeted tests if new store/helper tests are added.
- `pnpm --filter web lint` for structural React and TypeScript changes.

## Implementation Notes

- Use arrow functions in modified exams files.
- Do not add `useMemo` or `useCallback` unless a concrete rendering reason appears.
- Keep React Query mutation state out of Zustand.
- Keep all backend data recovery through `cachedAnswers`.
- Do not stage or commit unrelated existing `online/page.tsx` work when committing this design document.
