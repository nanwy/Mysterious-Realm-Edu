import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(
  join(currentDir, "questionnaire-page-shell.tsx"),
  "utf8"
);
const searchSource = readFileSync(
  join(currentDir, "questionnaire-search-form.tsx"),
  "utf8"
);
const resultsSource = readFileSync(
  join(currentDir, "questionnaire-results.tsx"),
  "utf8"
);
const dataSource = readFileSync(join(currentDir, "questionnaire-data.ts"), "utf8");

test("questionnaire page shell composes search, results, and pagination modules", () => {
  assert.match(shellSource, /data-testid="questionnaire-search-section"/);
  assert.match(shellSource, /data-testid="questionnaire-results-section"/);
  assert.match(shellSource, /QuestionnaireSearchForm/);
  assert.match(shellSource, /QuestionnaireResults/);
  assert.match(shellSource, /ResultsPagination/);
});

test("questionnaire page shell preserves loading, empty, and error states", () => {
  assert.match(resultsSource, /data-state="loading"/);
  assert.match(resultsSource, /data-state="empty"/);
  assert.match(resultsSource, /data-state="error"/);
  assert.match(dataSource, /getQuestionnaireList/);
  assert.match(shellSource, /fetchQuestionnaires/);
});

test("questionnaire search form keeps keyword query and reset affordances", () => {
  assert.match(searchSource, /关键词搜索/);
  assert.match(searchSource, /输入问卷名称/);
  assert.match(searchSource, /查询/);
  assert.match(searchSource, /重置/);
});
