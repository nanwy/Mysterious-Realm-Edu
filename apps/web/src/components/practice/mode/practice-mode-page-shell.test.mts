import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(
  join(currentDir, "practice-mode-page-shell.tsx"),
  "utf8"
);
const dataSource = readFileSync(
  join(currentDir, "practice-mode-data.ts"),
  "utf8"
);

test("practice mode shell includes intro, mode sections, and recent section", () => {
  assert.match(shellSource, /data-testid="practice-mode-intro"/);
  assert.match(shellSource, /data-testid="practice-mode-sections"/);
  assert.match(shellSource, /data-testid="practice-mode-recent"/);
  assert.match(shellSource, /自由练习区/);
  assert.match(shellSource, /题型练习区/);
  assert.match(shellSource, /最近练习区/);
});

test("practice mode data keeps repository and recent practice API reads", () => {
  assert.match(dataSource, /getRepositoryById/);
  assert.match(dataSource, /getRecentPractice/);
  assert.match(dataSource, /Promise\.allSettled/);
});

test("practice mode shell preserves loading, empty, and error states", () => {
  assert.match(shellSource, /data-state="loading"/);
  assert.match(shellSource, /data-state=\{state\}/);
  assert.match(shellSource, /state: "error" \| "empty"/);
});
