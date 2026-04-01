import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "courses-page-shell.tsx"), "utf8");
const filtersSource = readFileSync(join(currentDir, "courses-search-form.tsx"), "utf8");
const resultsSource = readFileSync(join(currentDir, "courses-results.tsx"), "utf8");

test("courses page shell renders filters and results sections", () => {
  assert.match(shellSource, /data-testid="courses-filter-section"/);
  assert.match(shellSource, /data-testid="courses-results-section"/);
  assert.match(shellSource, /CoursesSearchForm/);
  assert.match(shellSource, /CoursesResults/);
  assert.match(shellSource, /CoursesPagination/);
});

test("courses page shell keeps query and reset affordances", () => {
  assert.match(filtersSource, /关键词搜索/);
  assert.match(filtersSource, /排序方式/);
  assert.match(filtersSource, /课程分类/);
  assert.match(filtersSource, /查询/);
  assert.match(filtersSource, /重置/);
});

test("courses results preserves loading, empty, and error states", () => {
  assert.match(resultsSource, /data-state="loading"/);
  assert.match(resultsSource, /data-state="empty"/);
  assert.match(resultsSource, /data-state="error"/);
});
