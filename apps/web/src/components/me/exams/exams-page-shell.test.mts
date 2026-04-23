import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "exams-page-shell.tsx"), "utf8");

test("me exams page shell keeps filter/search/list and reachable action entries", () => {
  assert.match(shellSource, /data-testid="my-exams-filter-tabs"/);
  assert.match(shellSource, /data-testid="my-exams-search-region"/);
  assert.match(shellSource, /data-testid="my-exams-list-region"/);
  assert.match(shellSource, /data-testid="my-exam-action-entry"/);
  assert.match(shellSource, /进入考试/);
  assert.match(shellSource, /查看详情/);
  assert.match(shellSource, /ResultsPagination/);
  assert.match(shellSource, /getExamList/);
  assert.match(shellSource, /getUserExamResultList/);
});
