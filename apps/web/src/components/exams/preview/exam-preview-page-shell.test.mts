import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "exam-preview-page-shell.tsx"), "utf8");
const pageSource = readFileSync(
  join(currentDir, "..", "..", "..", "app", "(student)", "exams", "[examId]", "preview", "page.tsx"),
  "utf8"
);

test("exam preview page includes title, instructions, and start entry", () => {
  assert.match(pageSource, /ExamPreviewPageShell/);
  assert.match(shellSource, /data-testid="exam-preview-hero"/);
  assert.match(shellSource, /data-testid="exam-preview-instructions"/);
  assert.match(shellSource, /data-testid="exam-preview-start-action"/);
  assert.match(shellSource, /router\.push\(preview\.startHref\)/);
});

test("exam preview page keeps loading, empty, and error states", () => {
  assert.match(shellSource, /data-testid="exam-preview-loading"/);
  assert.match(shellSource, /data-testid="exam-preview-empty"/);
  assert.match(shellSource, /data-testid="exam-preview-error"/);
});
