import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
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
