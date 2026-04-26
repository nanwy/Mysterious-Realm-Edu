# Online Exam Zustand State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the online exam answering workflow draft state into the exams Zustand store while keeping React Query as the owner of backend session data.

**Architecture:** React Query continues to fetch `ExamOnlineSession`. Zustand owns only the active online answering draft: `userExamId`, `currentIndex`, `answers`, and `actionMessage`. A controller hook composes Zustand, the existing answer draft format, cache mutation, submit mutation, and derived view state so page and panel components stay presentational.

**Tech Stack:** Next.js App Router, React 19, TanStack React Query, Zustand, TypeScript, Node test runner, ESLint.

---

## Existing Model Constraints

Use the current online answer model exactly:

- `ExamOnlineQuestion.type` is numeric.
- Select question types are `1`, `2`, and `3`, already represented by `SELECT_QUESTION_TYPES`.
- Blank question type is `5`.
- Composite question type is `6`.
- `ExamOnlineOption` uses `{ id, tag, content }`.
- `ExamOnlineAnswerDraft` uses:
  - `index: number | string`
  - `questionType: number`
  - `answers?: string[]`
  - `answerIndex?: number[]`
  - `subjectiveAnswer?: string`
  - `blankAnswer?: string`
- Cache mutation payload must remain:

```ts
{
  limitTime: session.limitTime,
  userExamId: session.userExamId,
  examAnswers: nextAnswers,
}
```

- Submit mutation payload must remain:

```ts
{
  examId: session.examId,
  userExamId: session.userExamId,
  examAnswers: answers,
}
```

## File Structure

- Modify `apps/web/src/core/exams/store.ts`
  - Add online exam client-state fields and actions to the existing exams store.
  - Keep `activeExamId` unchanged.
  - Do not store `ExamOnlineSession`, questions, or answer groups.

- Modify `apps/web/src/core/exams/online.ts`
  - Add pure helpers that preserve the current `ExamOnlineAnswerDraft` shape.
  - Keep existing helper signatures:
    - `isQuestionAnswered(question, answers)`
    - `getAnswerForQuestion(question, answers)`

- Create `apps/web/src/core/exams/hooks.ts`
  - Add `useOnlineExamController(session)`.
  - Compose store selectors/actions, answer helpers, cache mutation, submit mutation, and derived state.

- Modify `apps/web/src/core/exams/index.ts`
  - Export the new controller hook and new online helpers.

- Modify `apps/web/src/components/exams/online/page.tsx`
  - Remove local `useState` workflow state.
  - Keep React Query session fetching and loading/empty states.
  - Render the workspace using controller state/actions.

- Modify `apps/web/src/components/exams/online/question-panel.tsx`
  - Replace many flat props with grouped `navigation`, `answerActions`, and `submitAction` props.
  - Keep this component presentational.

- Create `apps/web/src/core/exams/store.test.mts`
  - Test online store hydration and reset behavior.

- Create `apps/web/src/core/exams/online.test.mts`
  - Test pure answer update helpers against the actual answer draft model.

## Task 1: Add Online Draft State To Exams Store

**Files:**
- Modify: `apps/web/src/core/exams/store.ts`
- Test: `apps/web/src/core/exams/store.test.mts`

- [ ] **Step 1: Write failing store tests**

Create `apps/web/src/core/exams/store.test.mts`:

```ts
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { useExamStore } from "./store.ts";
import type { ExamOnlineAnswerDraft } from "./types.ts";

const cachedAnswers: ExamOnlineAnswerDraft[] = [
  {
    index: 1,
    questionType: 1,
    answers: ["option-a"],
    answerIndex: [0],
  },
];

beforeEach(() => {
  useExamStore.getState().resetOnlineSession();
});

test("hydrates online answers for a new session", () => {
  useExamStore.getState().hydrateOnlineSession("session-1", cachedAnswers);

  const state = useExamStore.getState();
  assert.equal(state.onlineUserExamId, "session-1");
  assert.deepEqual(state.onlineAnswers, cachedAnswers);
  assert.equal(state.onlineCurrentIndex, 0);
  assert.equal(state.onlineActionMessage, null);
});

test("same-session hydration does not overwrite in-progress draft", () => {
  useExamStore.getState().hydrateOnlineSession("session-1", cachedAnswers);
  useExamStore.getState().setOnlineAnswers([
    { ...cachedAnswers[0], answers: ["option-b"], answerIndex: [1] },
  ]);
  useExamStore.getState().setOnlineCurrentIndex(2);

  useExamStore.getState().hydrateOnlineSession("session-1", cachedAnswers);

  const state = useExamStore.getState();
  assert.equal(state.onlineCurrentIndex, 2);
  assert.deepEqual(state.onlineAnswers[0]?.answers, ["option-b"]);
});

test("different-session hydration resets draft state", () => {
  useExamStore.getState().hydrateOnlineSession("session-1", cachedAnswers);
  useExamStore.getState().setOnlineCurrentIndex(3);
  useExamStore.getState().setOnlineActionMessage("已保存");

  useExamStore.getState().hydrateOnlineSession("session-2", []);

  const state = useExamStore.getState();
  assert.equal(state.onlineUserExamId, "session-2");
  assert.deepEqual(state.onlineAnswers, []);
  assert.equal(state.onlineCurrentIndex, 0);
  assert.equal(state.onlineActionMessage, null);
});
```

- [ ] **Step 2: Run store test and verify it fails**

Run:

```bash
pnpm --filter web exec node --test --experimental-strip-types src/core/exams/store.test.mts
```

Expected: FAIL because the online store fields/actions do not exist yet.

- [ ] **Step 3: Implement the store slice**

Update `apps/web/src/core/exams/store.ts`:

```ts
"use client";

import { create } from "zustand";
import type { ExamOnlineAnswerDraft } from "./types";

interface ExamClientState {
  activeExamId: string | null;
  setActiveExam: (examId: string | null) => void;
  onlineUserExamId: string | null;
  onlineCurrentIndex: number;
  onlineAnswers: ExamOnlineAnswerDraft[];
  onlineActionMessage: string | null;
  hydrateOnlineSession: (
    userExamId: string,
    cachedAnswers: ExamOnlineAnswerDraft[],
  ) => void;
  resetOnlineSession: () => void;
  setOnlineCurrentIndex: (index: number) => void;
  setOnlineAnswers: (answers: ExamOnlineAnswerDraft[]) => void;
  setOnlineActionMessage: (message: string | null) => void;
}

const initialOnlineState = {
  onlineUserExamId: null,
  onlineCurrentIndex: 0,
  onlineAnswers: [] satisfies ExamOnlineAnswerDraft[],
  onlineActionMessage: null,
};

export const useExamStore = create<ExamClientState>((set, get) => ({
  activeExamId: null,
  setActiveExam: (examId) => set({ activeExamId: examId }),
  ...initialOnlineState,
  hydrateOnlineSession: (userExamId, cachedAnswers) => {
    if (get().onlineUserExamId === userExamId) {
      return;
    }

    set({
      onlineUserExamId: userExamId,
      onlineCurrentIndex: 0,
      onlineAnswers: cachedAnswers,
      onlineActionMessage: null,
    });
  },
  resetOnlineSession: () => set(initialOnlineState),
  setOnlineCurrentIndex: (index) => set({ onlineCurrentIndex: index }),
  setOnlineAnswers: (answers) => set({ onlineAnswers: answers }),
  setOnlineActionMessage: (message) => set({ onlineActionMessage: message }),
}));
```

- [ ] **Step 4: Run store test and verify it passes**

Run:

```bash
pnpm --filter web exec node --test --experimental-strip-types src/core/exams/store.test.mts
```

Expected: PASS.

## Task 2: Extract Pure Online Answer Helpers

**Files:**
- Modify: `apps/web/src/core/exams/online.ts`
- Test: `apps/web/src/core/exams/online.test.mts`

- [ ] **Step 1: Write failing helper tests**

Create `apps/web/src/core/exams/online.test.mts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildBlankAnswerDraft,
  buildOptionAnswerDraft,
  buildSubjectiveAnswerDraft,
  replaceOnlineAnswer,
} from "./online.ts";
import type { ExamOnlineAnswerDraft, ExamOnlineQuestion } from "./types.ts";

const question: ExamOnlineQuestion = {
  id: "q-1",
  index: 1,
  title: "Question",
  type: 1,
  typeName: "单选题",
  score: 2,
  options: [
    { id: "option-a", tag: "A", content: "A" },
    { id: "option-b", tag: "B", content: "B" },
  ],
  subQuestions: [],
};

test("replaceOnlineAnswer replaces an existing answer by answer key", () => {
  const answers: ExamOnlineAnswerDraft[] = [
    {
      index: 1,
      questionType: 1,
      answers: ["option-a"],
      answerIndex: [0],
    },
  ];

  const nextAnswers = replaceOnlineAnswer(answers, 1, {
    index: 1,
    questionType: 1,
    answers: ["option-b"],
    answerIndex: [1],
  });

  assert.deepEqual(nextAnswers, [
    {
      index: 1,
      questionType: 1,
      answers: ["option-b"],
      answerIndex: [1],
    },
  ]);
});

test("replaceOnlineAnswer removes an answer when next answer is null", () => {
  const answers: ExamOnlineAnswerDraft[] = [
    {
      index: 1,
      questionType: 1,
      answers: ["option-a"],
      answerIndex: [0],
    },
  ];

  assert.deepEqual(replaceOnlineAnswer(answers, 1, null), []);
});

test("buildOptionAnswerDraft toggles single choice answers", () => {
  const current = buildOptionAnswerDraft(question, undefined, "option-a", 0);
  const next = buildOptionAnswerDraft(question, current, "option-b", 1);
  const cleared = buildOptionAnswerDraft(question, next, "option-b", 1);

  assert.deepEqual(current.answers, ["option-a"]);
  assert.deepEqual(current.answerIndex, [0]);
  assert.deepEqual(next.answers, ["option-b"]);
  assert.deepEqual(next.answerIndex, [1]);
  assert.equal(cleared, null);
});

test("buildOptionAnswerDraft toggles multiple choice answers", () => {
  const multipleQuestion = { ...question, type: 2 };

  const first = buildOptionAnswerDraft(
    multipleQuestion,
    undefined,
    "option-a",
    0,
  );
  const second = buildOptionAnswerDraft(
    multipleQuestion,
    first,
    "option-b",
    1,
  );
  const third = buildOptionAnswerDraft(
    multipleQuestion,
    second,
    "option-a",
    0,
  );

  assert.deepEqual(first?.answers, ["option-a"]);
  assert.deepEqual(second?.answers, ["option-a", "option-b"]);
  assert.deepEqual(third?.answers, ["option-b"]);
});

test("buildSubjectiveAnswerDraft returns null for blank text", () => {
  assert.equal(buildSubjectiveAnswerDraft(question, "   "), null);
});

test("buildBlankAnswerDraft serializes filled blanks", () => {
  const blankQuestion = {
    ...question,
    type: 5,
    options: [{ id: "blank-1", tag: "1", content: "填空" }],
  };

  const answer = buildBlankAnswerDraft(blankQuestion, undefined, "1", "  A  ");

  assert.equal(answer?.blankAnswer, JSON.stringify([{ tag: "1", content: "A" }]));
});
```

- [ ] **Step 2: Run helper test and verify it fails**

Run:

```bash
pnpm --filter web exec node --test --experimental-strip-types src/core/exams/online.test.mts
```

Expected: FAIL because the new helper exports do not exist.

- [ ] **Step 3: Implement helpers using the current draft shape**

In `apps/web/src/core/exams/online.ts`, add helpers like:

```ts
export const replaceOnlineAnswer = (
  answers: ExamOnlineAnswerDraft[],
  index: number | string,
  nextAnswer: ExamOnlineAnswerDraft | null,
) => {
  const withoutCurrent = answers.filter(
    (answer) => makeAnswerKey(answer.index) !== String(index),
  );

  return nextAnswer ? [...withoutCurrent, nextAnswer] : withoutCurrent;
};

export const buildOptionAnswerDraft = (
  question: ExamOnlineQuestion,
  currentAnswer: ExamOnlineAnswerDraft | undefined,
  optionId: string,
  optionIndex: number,
): ExamOnlineAnswerDraft | null => {
  const currentIds = currentAnswer?.answers ?? [];
  const currentIndexes = currentAnswer?.answerIndex ?? [];
  const isSelected = currentIds.includes(optionId);
  const isSingle = question.type === 1 || question.type === 3;
  const nextIds = isSelected
    ? currentIds.filter((item) => item !== optionId)
    : isSingle
      ? [optionId]
      : [...currentIds, optionId];
  const nextIndexes = isSelected
    ? currentIndexes.filter((item) => item !== optionIndex)
    : isSingle
      ? [optionIndex]
      : [...currentIndexes, optionIndex];

  return nextIds.length
    ? {
        index: question.index,
        questionType: question.type,
        answers: nextIds,
        answerIndex: nextIndexes,
      }
    : null;
};

export const buildSubjectiveAnswerDraft = (
  question: ExamOnlineQuestion,
  value: string,
): ExamOnlineAnswerDraft | null =>
  value.trim()
    ? {
        index: question.index,
        questionType: question.type,
        subjectiveAnswer: value,
      }
    : null;

export const buildBlankAnswerDraft = (
  question: ExamOnlineQuestion,
  currentAnswer: ExamOnlineAnswerDraft | undefined,
  tag: string,
  value: string,
): ExamOnlineAnswerDraft | null => {
  const blankMap = parseBlankAnswer(currentAnswer?.blankAnswer);
  blankMap[tag] = value;
  const filled = Object.entries(blankMap)
    .filter(([, content]) => content.trim())
    .map(([itemTag, content]) => ({ tag: itemTag, content: content.trim() }));

  return filled.length
    ? {
        index: question.index,
        questionType: question.type,
        blankAnswer: JSON.stringify(filled),
      }
    : null;
};
```

- [ ] **Step 4: Run helper tests and verify they pass**

Run:

```bash
pnpm --filter web exec node --test --experimental-strip-types src/core/exams/online.test.mts
```

Expected: PASS.

## Task 3: Add Online Exam Controller Hook

**Files:**
- Create: `apps/web/src/core/exams/hooks.ts`
- Modify: `apps/web/src/core/exams/index.ts`
- Test: covered by store/helper tests and lint

- [ ] **Step 1: Create controller hook**

Create `apps/web/src/core/exams/hooks.ts`.

The hook must preserve existing helper signatures and mutation payloads:

- `getAnswerForQuestion(currentQuestion, answers)`
- `isQuestionAnswered(question, answers)`
- `cacheMutation.mutate({ limitTime, userExamId, examAnswers })`
- `submitMutation.mutate({ examId, userExamId, examAnswers }, callbacks)`

Implementation shape:

```ts
"use client";

import { useEffect, useRef } from "react";
import {
  buildBlankAnswerDraft,
  buildOptionAnswerDraft,
  buildSubjectiveAnswerDraft,
  getAnswerForQuestion,
  isQuestionAnswered,
  replaceOnlineAnswer,
} from "./online";
import {
  useCacheExamAnswerMutation,
  useSubmitExamMutation,
} from "./mutations";
import { useExamStore } from "./store";
import type { ExamOnlineAnswerDraft, ExamOnlineSession } from "./types";

export const useOnlineExamController = (session: ExamOnlineSession) => {
  const initialCachedAnswersRef = useRef(session.cachedAnswers);
  const cacheMutation = useCacheExamAnswerMutation();
  const submitMutation = useSubmitExamMutation();
  const currentIndex = useExamStore((state) => state.onlineCurrentIndex);
  const answers = useExamStore((state) => state.onlineAnswers);
  const actionMessage = useExamStore((state) => state.onlineActionMessage);
  const hydrateOnlineSession = useExamStore(
    (state) => state.hydrateOnlineSession,
  );
  const resetOnlineSession = useExamStore((state) => state.resetOnlineSession);
  const setCurrentIndex = useExamStore((state) => state.setOnlineCurrentIndex);
  const setAnswers = useExamStore((state) => state.setOnlineAnswers);
  const setActionMessage = useExamStore(
    (state) => state.setOnlineActionMessage,
  );

  useEffect(() => {
    hydrateOnlineSession(session.userExamId, initialCachedAnswersRef.current);
    return () => resetOnlineSession();
  }, [
    hydrateOnlineSession,
    resetOnlineSession,
    session.userExamId,
  ]);

  const questions = session.questions;
  const currentQuestion = questions[currentIndex] ?? questions[0];
  const answerForCurrent = currentQuestion
    ? getAnswerForQuestion(currentQuestion, answers)
    : undefined;
  const answeredCount = questions.filter((question) =>
    isQuestionAnswered(question, answers),
  ).length;
  const progress = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  const persistAnswers = (nextAnswers: ExamOnlineAnswerDraft[]) => {
    setAnswers(nextAnswers);
    cacheMutation.mutate({
      limitTime: session.limitTime,
      userExamId: session.userExamId,
      examAnswers: nextAnswers,
    });
    setActionMessage("答案已自动保存");
  };

  const replaceCurrentAnswer = (nextAnswer: ExamOnlineAnswerDraft | null) => {
    if (!currentQuestion) {
      return;
    }

    persistAnswers(replaceOnlineAnswer(answers, currentQuestion.index, nextAnswer));
  };

  return {
    questions,
    answerGroups: session.answerGroups,
    currentQuestion,
    currentIndex,
    answerForCurrent,
    answers,
    answeredCount,
    progress,
    actionMessage,
    cachePending: cacheMutation.isPending,
    submitPending: submitMutation.isPending,
    selectQuestion: (index: number) => {
      const nextIndex = questions.findIndex((question) => question.index === index);
      setCurrentIndex(Math.max(0, nextIndex));
    },
    previousQuestion: () => setCurrentIndex(Math.max(0, currentIndex - 1)),
    nextQuestion: () =>
      setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1)),
    toggleOption: (optionId: string, optionIndex: number) => {
      if (!currentQuestion) {
        return;
      }

      replaceCurrentAnswer(
        buildOptionAnswerDraft(
          currentQuestion,
          answerForCurrent,
          optionId,
          optionIndex,
        ),
      );
    },
    updateSubjectiveAnswer: (value: string) => {
      if (!currentQuestion) {
        return;
      }

      replaceCurrentAnswer(buildSubjectiveAnswerDraft(currentQuestion, value));
    },
    updateBlankAnswer: (tag: string, value: string) => {
      if (!currentQuestion) {
        return;
      }

      replaceCurrentAnswer(
        buildBlankAnswerDraft(currentQuestion, answerForCurrent, tag, value),
      );
    },
    submitExam: () => {
      const unanswered = Math.max(0, questions.length - answeredCount);
      setActionMessage(
        unanswered
          ? `还有 ${unanswered} 题未作答。请确认是否继续提交当前答案。`
          : "正在提交当前答题结果。",
      );
      submitMutation.mutate(
        {
          examId: session.examId,
          userExamId: session.userExamId,
          examAnswers: answers,
        },
        {
          onSuccess: () =>
            setActionMessage("试卷已提交，稍后可在成绩中心查看结果。"),
          onError: () =>
            setActionMessage(
              "提交暂未成功，答案仍保留在当前页面并会继续尝试缓存。",
            ),
        },
      );
    },
  };
};
```

- [ ] **Step 2: Export hook**

Modify `apps/web/src/core/exams/index.ts`:

```ts
export * from "./hooks";
```

- [ ] **Step 3: Run lint after hook creation**

Run:

```bash
pnpm --filter web lint
```

Expected: no hook dependency or import errors. Fix any concrete issues before moving on.

## Task 4: Refactor Online Page To Use Controller

**Files:**
- Modify: `apps/web/src/components/exams/online/page.tsx`

- [ ] **Step 1: Remove local workflow state**

In `apps/web/src/components/exams/online/page.tsx`:

- Remove `useMemo` and `useState` imports.
- Remove local state for `currentIndex`, `answers`, and `actionMessage`.
- Remove local `persistAnswers`, `updateAnswers`, `replaceAnswer`, `toggleOption`, `updateSubjectiveAnswer`, `updateBlankAnswer`, `selectQuestion`, and `submitExam`.
- Remove direct imports of answer helpers and mutation hooks now owned by the controller.

- [ ] **Step 2: Wire controller into workspace**

Use:

```tsx
const OnlineExamWorkspace = ({ session }: { session: ExamOnlineSession }) => {
  const onlineExam = useOnlineExamController(session);

  if (!onlineExam.currentQuestion) {
    return <OnlineExamEmptyState />;
  }

  return (
    <div className="grid gap-5">
      <OnlineExamSummary
        session={session}
        questionTotal={onlineExam.questions.length}
      />
      {/* existing layout */}
    </div>
  );
};
```

Keep:

```tsx
return <OnlineExamWorkspace key={session.userExamId} session={session} />;
```

## Task 5: Group Online Question Panel Props

**Files:**
- Modify: `apps/web/src/components/exams/online/question-panel.tsx`
- Modify: `apps/web/src/components/exams/online/page.tsx`

- [ ] **Step 1: Replace flat prop interface**

In `question-panel.tsx`, replace the inline prop object with named grouped props:

```ts
interface OnlineQuestionPanelNavigation {
  currentIndex: number;
  questionTotal: number;
  onPrevious: () => void;
  onNext: () => void;
}

interface OnlineQuestionPanelAnswerActions {
  onToggleOption: (optionId: string, optionIndex: number) => void;
  onUpdateSubjectiveAnswer: (value: string) => void;
  onUpdateBlankAnswer: (tag: string, value: string) => void;
}

interface OnlineQuestionPanelSubmitAction {
  pending: boolean;
  onSubmit: () => void;
}

interface OnlineQuestionPanelProps {
  question: ExamOnlineQuestion;
  answer: ExamOnlineAnswerDraft | null | undefined;
  navigation: OnlineQuestionPanelNavigation;
  answerActions: OnlineQuestionPanelAnswerActions;
  submitAction: OnlineQuestionPanelSubmitAction;
}
```

- [ ] **Step 2: Update JSX references**

Replace old names:

- `currentQuestion` -> `question`
- `answerForCurrent` -> `answer`
- `currentIndex` -> `navigation.currentIndex`
- `questionTotal` -> `navigation.questionTotal`
- `submitPending` -> `submitAction.pending`
- `onToggleOption` -> `answerActions.onToggleOption`
- `onUpdateSubjectiveAnswer` -> `answerActions.onUpdateSubjectiveAnswer`
- `onUpdateBlankAnswer` -> `answerActions.onUpdateBlankAnswer`
- `onPrevious` -> `navigation.onPrevious`
- `onNext` -> `navigation.onNext`
- `onSubmit` -> `submitAction.onSubmit`

- [ ] **Step 3: Update page call site**

In `page.tsx`, call:

```tsx
<OnlineQuestionPanel
  question={onlineExam.currentQuestion}
  answer={onlineExam.answerForCurrent}
  navigation={{
    currentIndex: onlineExam.currentIndex,
    questionTotal: onlineExam.questions.length,
    onPrevious: onlineExam.previousQuestion,
    onNext: onlineExam.nextQuestion,
  }}
  answerActions={{
    onToggleOption: onlineExam.toggleOption,
    onUpdateSubjectiveAnswer: onlineExam.updateSubjectiveAnswer,
    onUpdateBlankAnswer: onlineExam.updateBlankAnswer,
  }}
  submitAction={{
    pending: onlineExam.submitPending,
    onSubmit: onlineExam.submitExam,
  }}
/>
```

- [ ] **Step 4: Run lint**

Run:

```bash
pnpm --filter web lint
```

Expected: PASS.

## Task 6: Final Verification And Commit

**Files:**
- Modify: `apps/web/src/core/exams/*`
- Modify: `apps/web/src/components/exams/online/*`

- [ ] **Step 1: Ensure child components do not read Zustand directly**

Run:

```bash
rg "useExamStore|useOnlineExamController" apps/web/src/components/exams/online
```

Expected: only `page.tsx` imports `useOnlineExamController`; no online child component imports `useExamStore`.

- [ ] **Step 2: Run targeted tests**

Run:

```bash
pnpm --filter web exec node --test --experimental-strip-types src/core/exams/store.test.mts src/core/exams/online.test.mts
```

Expected: PASS.

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm --filter web lint
```

Expected: PASS.

- [ ] **Step 4: Inspect diff for state ownership**

Run:

```bash
git diff -- apps/web/src/core/exams apps/web/src/components/exams/online
```

Expected:

- React Query session data stays in `page.tsx`.
- Zustand only stores online draft/UI state.
- No fetched question/session data is copied into Zustand.
- Mutation payloads still use `limitTime`, `userExamId`, `examAnswers`, and `examId` exactly as before.
- `OnlineQuestionPanel` props are grouped.
- Existing unrelated `online/page.tsx` edits are reconciled into the final controller-based implementation.

- [ ] **Step 5: Commit implementation**

Stage only relevant implementation files:

```bash
git add apps/web/src/core/exams apps/web/src/components/exams/online
git commit -m "refactor: manage online exam draft state with zustand"
```

Expected: commit succeeds after tests and lint pass.
