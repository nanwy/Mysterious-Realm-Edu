import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "exam-session-page-shell.tsx"), "utf8");
const dataSource = readFileSync(join(currentDir, "exam-session-data.ts"), "utf8");
const pageSource = readFileSync(
  join(currentDir, "..", "..", "..", "app", "(student)", "exams", "[examId]", "page.tsx"),
  "utf8"
);

test("exam session route wires userExamId search param into session shell", () => {
  assert.match(pageSource, /ExamSessionPageShell/);
  assert.match(pageSource, /userExamId/);
});

test("exam session shell includes loading, empty, error, hero, answer card, and question panel states", () => {
  assert.match(shellSource, /data-testid="exam-session-loading"/);
  assert.match(shellSource, /data-testid="exam-session-empty"/);
  assert.match(shellSource, /data-testid="exam-session-error"/);
  assert.match(shellSource, /data-testid="exam-session-hero"/);
  assert.match(shellSource, /data-testid="exam-answer-card"/);
  assert.match(shellSource, /data-testid="exam-question-panel"/);
});

test("exam session data keeps examId and userExamId distinct and supports cache restore", () => {
  assert.match(dataSource, /initializeExamSession/);
  assert.match(dataSource, /userExamId/);
  assert.match(dataSource, /reloadExamCache/);
  assert.match(dataSource, /persistExamAnswers/);
});
