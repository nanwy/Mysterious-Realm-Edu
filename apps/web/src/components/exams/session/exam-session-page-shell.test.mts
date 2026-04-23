import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "exam-session-page-shell.tsx"), "utf8");
const dataSource = readFileSync(join(currentDir, "exam-session-data.ts"), "utf8");
const pageSource = readFileSync(
  join(currentDir, "..", "..", "..", "app", "(student)", "exams", "[examId]", "session", "page.tsx"),
  "utf8"
);

test("exam session page wires the route into the student shell", () => {
  assert.match(pageSource, /ExamSessionPageShell/);
  assert.match(pageSource, /title="在线考试"/);
});

test("exam session shell keeps critical exam-answering states and regions", () => {
  assert.match(shellSource, /data-testid="exam-session-loading"/);
  assert.match(shellSource, /data-testid="exam-session-empty"/);
  assert.match(shellSource, /data-testid="exam-session-error"/);
  assert.match(shellSource, /data-testid="exam-session-hero"/);
  assert.match(shellSource, /data-testid="exam-session-question-grid"/);
  assert.match(shellSource, /提交试卷/);
});

test("exam session data distinguishes initialization, cache, and submit flows", () => {
  assert.match(dataSource, /initializeExamSession/);
  assert.match(dataSource, /persistExamCache/);
  assert.match(dataSource, /submitExamSession/);
  assert.match(dataSource, /userExamId/);
});
