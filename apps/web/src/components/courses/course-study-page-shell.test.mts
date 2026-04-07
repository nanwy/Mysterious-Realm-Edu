import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "course-study-page-shell.tsx"), "utf8");

test("course study page shell exposes hero, banner, and signal regions", () => {
  assert.match(shellSource, /data-testid="course-study-page-shell"/);
  assert.match(shellSource, /data-testid="course-study-hero"/);
  assert.match(shellSource, /data-testid="course-study-state-banner"/);
  assert.match(shellSource, /data-testid="course-study-signal-list"/);
});

test("course study page shell keeps core workbench copy for study continuation", () => {
  assert.match(shellSource, /Study Workbench/);
  assert.match(shellSource, /继续学习前先看三件事/);
  assert.match(shellSource, /最近任务/);
  assert.match(shellSource, /任务目录/);
  assert.match(shellSource, /节奏判断/);
});
