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
  useExamStore.getState().resetOnline();
});

test("hydrateOnline seeds a fresh session", () => {
  useExamStore.getState().hydrateOnline("session-1", cachedAnswers);

  const state = useExamStore.getState();
  assert.equal(state.onlineUserExamId, "session-1");
  assert.deepEqual(state.onlineAnswers, cachedAnswers);
  assert.equal(state.onlineCurrentIndex, 0);
  assert.equal(state.onlineCacheStatus, "idle");
  assert.equal(state.onlineSubmitStatus, "idle");
});

test("hydrateOnline keeps in-progress draft for the same session", () => {
  const store = useExamStore.getState();
  store.hydrateOnline("session-1", cachedAnswers);
  store.updateOnlineAnswers((current) => [
    ...current,
    {
      index: 2,
      questionType: 1,
      answers: ["opt-b"],
      answerIndex: [1],
    },
  ]);
  store.selectOnlineQuestionAt(2);

  store.hydrateOnline("session-1", cachedAnswers);

  const state = useExamStore.getState();
  assert.equal(state.onlineCurrentIndex, 2);
  assert.equal(state.onlineAnswers.length, 2);
  assert.deepEqual(
    state.onlineAnswers.find((answer) => answer.index === 2)?.answers,
    ["opt-b"]
  );
});

test("hydrateOnline switching sessions resets all online state", () => {
  const store = useExamStore.getState();
  store.hydrateOnline("session-1", cachedAnswers);
  store.selectOnlineQuestionAt(3);
  store.setOnlineCacheStatus("saved");
  store.setOnlineSubmitStatus("submitting");

  store.hydrateOnline("session-2", []);

  const state = useExamStore.getState();
  assert.equal(state.onlineUserExamId, "session-2");
  assert.deepEqual(state.onlineAnswers, []);
  assert.equal(state.onlineCurrentIndex, 0);
  assert.equal(state.onlineCacheStatus, "idle");
  assert.equal(state.onlineSubmitStatus, "idle");
});

test("updateOnlineAnswers receives the latest array regardless of caller closures", () => {
  const store = useExamStore.getState();
  store.hydrateOnline("session-1", []);

  store.updateOnlineAnswers((current) => [
    ...current,
    { index: 1, questionType: 1, answers: ["a"], answerIndex: [0] },
  ]);
  store.updateOnlineAnswers((current) => [
    ...current,
    { index: 2, questionType: 1, answers: ["b"], answerIndex: [0] },
  ]);

  const state = useExamStore.getState();
  assert.equal(state.onlineAnswers.length, 2);
  assert.deepEqual(
    state.onlineAnswers.map((answer) => answer.index),
    [1, 2]
  );
});

test("shiftOnlineQuestion clamps within [0, lastIndex]", () => {
  const store = useExamStore.getState();
  store.hydrateOnline("session-1", []);

  store.shiftOnlineQuestion(-1, 4);
  assert.equal(useExamStore.getState().onlineCurrentIndex, 0);

  store.selectOnlineQuestionAt(4);
  store.shiftOnlineQuestion(1, 4);
  assert.equal(useExamStore.getState().onlineCurrentIndex, 4);

  store.shiftOnlineQuestion(-2, 4);
  assert.equal(useExamStore.getState().onlineCurrentIndex, 2);
});

test("setOnlineCacheStatus and setOnlineSubmitStatus update enums", () => {
  const store = useExamStore.getState();
  store.hydrateOnline("session-1", []);

  store.setOnlineCacheStatus("saving");
  store.setOnlineSubmitStatus("submitting");

  let state = useExamStore.getState();
  assert.equal(state.onlineCacheStatus, "saving");
  assert.equal(state.onlineSubmitStatus, "submitting");

  store.setOnlineCacheStatus("error");
  store.setOnlineSubmitStatus("submitted");
  state = useExamStore.getState();
  assert.equal(state.onlineCacheStatus, "error");
  assert.equal(state.onlineSubmitStatus, "submitted");
});

test("only the latest cache request can update cache status", () => {
  const store = useExamStore.getState();
  store.hydrateOnline("session-1", []);

  const firstRequest = store.beginOnlineCacheRequest();
  const secondRequest = store.beginOnlineCacheRequest();

  store.finishOnlineCacheRequest(firstRequest, "error");
  let state = useExamStore.getState();
  assert.equal(state.onlineCacheStatus, "saving");

  store.finishOnlineCacheRequest(secondRequest, "saved");
  state = useExamStore.getState();
  assert.equal(state.onlineCacheStatus, "saved");
});

test("submitted terminal status can be set after resetting draft state", () => {
  const store = useExamStore.getState();
  store.hydrateOnline("session-1", cachedAnswers);
  store.selectOnlineQuestionAt(2);

  store.resetOnline();
  store.setOnlineSubmitStatus("submitted");

  const state = useExamStore.getState();
  assert.equal(state.onlineUserExamId, null);
  assert.deepEqual(state.onlineAnswers, []);
  assert.equal(state.onlineCurrentIndex, 0);
  assert.equal(state.onlineSubmitStatus, "submitted");
});
