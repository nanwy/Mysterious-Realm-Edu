import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "course-study-page-shell.tsx"), "utf8");

test("course study page shell exposes hero, progress, snapshot, and error regions", () => {
  assert.match(shellSource, /data-testid="course-study-hero"/);
  assert.match(shellSource, /data-testid="course-study-progress"/);
  assert.match(shellSource, /data-testid="course-study-snapshot"/);
  assert.match(shellSource, /data-testid="course-study-error"/);
  assert.match(shellSource, /buildCourseStudyViewModel/);
  assert.match(shellSource, /EmptyState/);
  assert.match(shellSource, /StatusCard/);
});
