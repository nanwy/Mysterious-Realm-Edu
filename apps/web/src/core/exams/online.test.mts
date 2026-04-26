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

  assert.deepEqual(current?.answers, ["option-a"]);
  assert.deepEqual(current?.answerIndex, [0]);
  assert.deepEqual(next?.answers, ["option-b"]);
  assert.deepEqual(next?.answerIndex, [1]);
  assert.equal(cleared, null);
});

test("buildOptionAnswerDraft toggles multiple choice answers", () => {
  const multipleQuestion = { ...question, type: 2 };

  const first = buildOptionAnswerDraft(
    multipleQuestion,
    undefined,
    "option-a",
    0
  );
  const second = buildOptionAnswerDraft(
    multipleQuestion,
    first,
    "option-b",
    1
  );
  const third = buildOptionAnswerDraft(
    multipleQuestion,
    second,
    "option-a",
    0
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

  assert.equal(
    answer?.blankAnswer,
    JSON.stringify([{ tag: "1", content: "A" }])
  );
});
