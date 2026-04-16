import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "study-progress-page-shell.tsx"), "utf8");

test("study progress page shell keeps filter, overview, list, and pagination structure", () => {
  assert.match(shellSource, /data-testid="study-progress-filter-section"/);
  assert.match(shellSource, /data-testid="study-progress-overview"/);
  assert.match(shellSource, /data-testid="study-progress-list"|data-testid="study-progress-list-region"/);
  assert.match(shellSource, /data-testid="study-progress-pagination"/);
});
