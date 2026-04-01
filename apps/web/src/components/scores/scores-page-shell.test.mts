import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const scoresPageShellSource = readFileSync(
  new URL("./scores-page-shell.tsx", import.meta.url),
  "utf8"
);

test("scores page shell renders filter controls", () => {
  assert.match(scoresPageShellSource, /data-testid="scores-filter-section"/);
  assert.match(scoresPageShellSource, /考试名称/);
  assert.match(scoresPageShellSource, /是否通过/);
  assert.match(scoresPageShellSource, /查询/);
  assert.match(scoresPageShellSource, /清空/);
});

test("scores page shell renders results states", () => {
  assert.match(scoresPageShellSource, /data-testid="scores-results-section"/);
  assert.match(scoresPageShellSource, /成绩结果/);
  assert.match(scoresPageShellSource, /ScoresResults/);
  assert.match(scoresPageShellSource, /EmptyState/);
});
