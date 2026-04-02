import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "exams-page-shell.tsx"), "utf8");
const filtersSource = readFileSync(join(currentDir, "exams-filters.tsx"), "utf8");
const resultsSource = readFileSync(join(currentDir, "exams-results.tsx"), "utf8");
const typesSource = readFileSync(join(currentDir, "exams-types.ts"), "utf8");

test("exams page shell contains tabs, search, results, and pagination structure", () => {
  assert.match(shellSource, /data-testid="exams-tabs-section"/);
  assert.match(filtersSource, /data-testid="exams-search-section"/);
  assert.match(resultsSource, /data-testid="exams-results-section"/);
  assert.match(shellSource, /data-testid="exams-pagination-section"/);
  assert.match(shellSource, /ResultsPagination/);
});

test("exams filters keep keyword search and reset affordances", () => {
  assert.match(filtersSource, /关键词搜索/);
  assert.match(filtersSource, /查询/);
  assert.match(filtersSource, /重置/);
  assert.match(typesSource, /公开考试/);
  assert.match(typesSource, /我的考试/);
  assert.match(typesSource, /进行中/);
  assert.match(typesSource, /未开始/);
  assert.match(typesSource, /已结束/);
});

test("exams results preserve loading, empty, and error states", () => {
  assert.match(resultsSource, /data-state="loading"/);
  assert.match(resultsSource, /data-state="empty"/);
  assert.match(resultsSource, /data-state="error"/);
});
