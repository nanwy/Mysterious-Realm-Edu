import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scoresPageShellSource = readFileSync(
  new URL("./scores-page-shell.tsx", import.meta.url),
  "utf8"
);
const currentDir = dirname(fileURLToPath(import.meta.url));
const scoresFiltersSource = readFileSync(join(currentDir, "scores-filters.tsx"), "utf8");

test("scores page shell renders filter controls", () => {
  assert.match(scoresPageShellSource, /data-testid="scores-filter-section"/);
  assert.match(scoresPageShellSource, /当前查询策略/);
  assert.match(scoresFiltersSource, /考试名称/);
  assert.match(scoresFiltersSource, /是否通过/);
  assert.match(scoresFiltersSource, /查询/);
  assert.match(scoresFiltersSource, /清空/);
});

test("scores page shell renders results states", () => {
  assert.match(scoresPageShellSource, /data-testid="scores-results-section"/);
  assert.match(scoresPageShellSource, /成绩结果/);
  assert.match(scoresPageShellSource, /ScoresResults/);
  assert.match(scoresPageShellSource, /EmptyState/);
});

test("scores filters use tanstack form and shared select primitives", () => {
  assert.match(scoresFiltersSource, /@tanstack\/react-form/);
  assert.match(scoresFiltersSource, /SelectTrigger/);
  assert.match(scoresFiltersSource, /SelectContent/);
});
