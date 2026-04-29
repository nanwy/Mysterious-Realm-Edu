import { EXAM_QUESTION_TYPE } from "@workspace/api";
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildInvigilateWebSocketBaseUrl,
  buildInvigilateWebSocketUrl,
  getExamWatermarkContent,
  getInvigilateSnapIntervalMs,
  normalizeInvigilateAnswer,
  parseInvigilatePeerList,
  parseInvigilateSocketMessage,
} from "./invigilate.ts";
import {
  buildBlankAnswerDraft,
  buildOptionAnswerDraft,
  buildSubjectiveAnswerDraft,
  getRemainingScreenSwitchTimes,
  replaceOnlineAnswer,
  shouldRecordScreenSwitch,
} from "./online.ts";
import type { ExamOnlineAnswerDraft, ExamOnlineQuestion } from "./types.ts";

const question: ExamOnlineQuestion = {
  id: "q-1",
  index: 1,
  title: "Question",
  type: EXAM_QUESTION_TYPE.RADIO,
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
      questionType: EXAM_QUESTION_TYPE.RADIO,
      answers: ["option-a"],
      answerIndex: [0],
    },
  ];

  const nextAnswers = replaceOnlineAnswer(answers, 1, {
    index: 1,
    questionType: EXAM_QUESTION_TYPE.RADIO,
    answers: ["option-b"],
    answerIndex: [1],
  });

  assert.deepEqual(nextAnswers, [
    {
      index: 1,
      questionType: EXAM_QUESTION_TYPE.RADIO,
      answers: ["option-b"],
      answerIndex: [1],
    },
  ]);
});

test("replaceOnlineAnswer removes an answer when next answer is null", () => {
  const answers: ExamOnlineAnswerDraft[] = [
    {
      index: 1,
      questionType: EXAM_QUESTION_TYPE.RADIO,
      answers: ["option-a"],
      answerIndex: [0],
    },
  ];

  assert.deepEqual(replaceOnlineAnswer(answers, 1, null), []);
});

test("buildOptionAnswerDraft toggles single choice answers", () => {
  const current = buildOptionAnswerDraft(question, undefined, "option-a", 0);
  assert.ok(current);
  const next = buildOptionAnswerDraft(question, current, "option-b", 1);
  assert.ok(next);
  const cleared = buildOptionAnswerDraft(question, next, "option-b", 1);

  assert.deepEqual(current?.answers, ["option-a"]);
  assert.deepEqual(current?.answerIndex, [0]);
  assert.deepEqual(next?.answers, ["option-b"]);
  assert.deepEqual(next?.answerIndex, [1]);
  assert.equal(cleared, null);
});

test("buildOptionAnswerDraft toggles multiple choice answers", () => {
  const multipleQuestion = { ...question, type: EXAM_QUESTION_TYPE.MULTI };

  const first = buildOptionAnswerDraft(
    multipleQuestion,
    undefined,
    "option-a",
    0
  );
  const second = buildOptionAnswerDraft(
    multipleQuestion,
    first ?? undefined,
    "option-b",
    1
  );
  const third = buildOptionAnswerDraft(
    multipleQuestion,
    second ?? undefined,
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
    type: EXAM_QUESTION_TYPE.BLANK,
    options: [{ id: "blank-1", tag: "1", content: "填空" }],
  };

  const answer = buildBlankAnswerDraft(blankQuestion, undefined, "1", "  A  ");

  assert.equal(
    answer?.blankAnswer,
    JSON.stringify([{ tag: "1", content: "A" }])
  );
});

test("shouldRecordScreenSwitch follows leave switch threshold", () => {
  assert.equal(
    shouldRecordScreenSwitch({
      leaveOn: true,
      leaveTime: 3,
      leftAt: 1_000,
      returnedAt: 4_500,
    }),
    true
  );
  assert.equal(
    shouldRecordScreenSwitch({
      leaveOn: true,
      leaveTime: 3,
      leftAt: 1_000,
      returnedAt: 3_000,
    }),
    false
  );
  assert.equal(
    shouldRecordScreenSwitch({
      leaveOn: false,
      leaveTime: 0,
      leftAt: 1_000,
      returnedAt: 2_000,
    }),
    false
  );
});

test("getRemainingScreenSwitchTimes mirrors backend leave count rule", () => {
  assert.equal(getRemainingScreenSwitchTimes(3, 2), 1);
  assert.equal(getRemainingScreenSwitchTimes(3, 4), -1);
  assert.equal(getRemainingScreenSwitchTimes(null, 4), null);
});

test("getExamWatermarkContent mirrors Vue realname plus username rule", () => {
  assert.equal(
    getExamWatermarkContent({
      enabled: true,
      profile: { id: "u-1", realname: "张三", username: "student01" },
    }),
    "张三student01"
  );
  assert.equal(
    getExamWatermarkContent({
      enabled: false,
      profile: { id: "u-1", realname: "张三", username: "student01" },
    }),
    ""
  );
});

test("getInvigilateSnapIntervalMs defaults to one minute and clamps invalid values", () => {
  assert.equal(getInvigilateSnapIntervalMs(2), 120_000);
  assert.equal(getInvigilateSnapIntervalMs(0), 60_000);
  assert.equal(getInvigilateSnapIntervalMs("bad"), 60_000);
});

test("parseInvigilateSocketMessage ignores heartbeat and parses JSON messages", () => {
  assert.equal(parseInvigilateSocketMessage("ping"), null);
  assert.deepEqual(parseInvigilateSocketMessage('{"msgType":"forceSubmitExam"}'), {
    msgType: "forceSubmitExam",
  });
});

test("parseInvigilatePeerList splits monitor ids", () => {
  assert.deepEqual(parseInvigilatePeerList("a,b, c ,"), ["a", "b", "c"]);
  assert.deepEqual(parseInvigilatePeerList({ id: "a" }), []);
});

test("normalizeInvigilateAnswer keeps the old SDP newline compatibility fix", () => {
  assert.deepEqual(normalizeInvigilateAnswer({ type: "answer", sdp: "abc" }), {
    type: "answer",
    sdp: "abc\n",
  });
});

test("buildInvigilateWebSocketUrl derives the websocket endpoint from API base", () => {
  const baseUrl = buildInvigilateWebSocketBaseUrl(
    undefined,
    "https://example.test/api/v1"
  );

  assert.equal(baseUrl, "wss://example.test");
  assert.equal(
    buildInvigilateWebSocketUrl({
      baseUrl,
      userId: "user-1",
      token: "abc.def",
    }),
    "wss://example.test/websocket/user-1_abcdef_1"
  );
});
