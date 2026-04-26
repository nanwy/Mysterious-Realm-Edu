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
