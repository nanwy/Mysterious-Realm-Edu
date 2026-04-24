import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "purchases-page-shell.tsx"), "utf8");

test("purchases page shell keeps type switch, list region, and action entry structure", () => {
  assert.match(shellSource, /data-testid="purchases-tabs"/);
  assert.match(shellSource, /data-testid="purchases-list"|data-testid="purchases-list-region"/);
  assert.match(shellSource, /data-testid="purchase-action-entry"/);
  assert.match(shellSource, /已购课程/);
  assert.match(shellSource, /已购考试/);
  assert.match(shellSource, /进入课程/);
  assert.match(shellSource, /查看考试/);
  assert.match(shellSource, /ResultsPagination/);
  assert.match(shellSource, /selectPurchaseCourseList/);
  assert.match(shellSource, /selectPurchaseExamList/);
});

test("purchased courses and exams do not build action entries from fallback ids", () => {
  assert.match(shellSource, /const routeId = toText\(record\.id \?\? record\.courseId \?\? record\.goodsId\);/);
  assert.match(shellSource, /const id = routeId \|\| `course-\$\{index \+ 1\}`;/);
  assert.match(shellSource, /href: routeId \? `\/courses\/\$\{routeId\}` : null/);
  assert.doesNotMatch(shellSource, /href: id \? `\/courses\/\$\{id\}` : null/);
  assert.doesNotMatch(shellSource, /toText\(record\.id \?\? record\.courseId \?\? record\.goodsId,\s*`course-\$\{index \+ 1\}`\)/);

  assert.match(shellSource, /const routeId = toText\(record\.id \?\? record\.examId \?\? record\.goodsId\);/);
  assert.match(shellSource, /const id = routeId \|\| `exam-\$\{index \+ 1\}`;/);
  assert.match(shellSource, /href: routeId \? `\/exams\/\$\{routeId\}\/preview` : null/);
  assert.doesNotMatch(shellSource, /href: id \? `\/exams\/\$\{id\}\/preview` : null/);
  assert.doesNotMatch(shellSource, /toText\(record\.id \?\? record\.examId \?\? record\.goodsId,\s*`exam-\$\{index \+ 1\}`\)/);
});
