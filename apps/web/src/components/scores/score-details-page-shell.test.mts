import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const scoreDetailsShellSource = readFileSync(
  new URL("./score-details-page-shell.tsx", import.meta.url),
  "utf8"
);

test("score details shell renders filter controls", () => {
  assert.match(scoreDetailsShellSource, /data-testid="score-details-filter-section"/);
  assert.match(scoreDetailsShellSource, /是否通过/);
  assert.match(scoreDetailsShellSource, /查询/);
  assert.match(scoreDetailsShellSource, /清空/);
});

test("score details shell renders results states and pagination", () => {
  assert.match(scoreDetailsShellSource, /data-testid="score-details-results-section"/);
  assert.match(scoreDetailsShellSource, /成绩明细结果/);
  assert.match(scoreDetailsShellSource, /EmptyState/);
  assert.match(scoreDetailsShellSource, /ResultsPagination/);
});
