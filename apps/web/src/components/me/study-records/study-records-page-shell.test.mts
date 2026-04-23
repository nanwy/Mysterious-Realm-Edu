import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "study-records-page-shell.tsx"), "utf8");

test("study records page shell keeps filter, overview, list, and pagination structure", () => {
  assert.match(shellSource, /data-testid="study-records-filter-section"/);
  assert.match(shellSource, /data-testid="study-records-overview"/);
  assert.match(shellSource, /data-testid="study-records-list"|data-testid="study-records-list-region"/);
  assert.match(shellSource, /data-testid="study-records-pagination"/);
});

test("study records payload parser accepts common pagination shapes", () => {
  assert.match(shellSource, /function toStudyRecordsPayload\(value: unknown\): StudyRecordsPayload/);
  assert.match(shellSource, /if \(Array\.isArray\(value\)\)/);
  assert.match(shellSource, /Array\.isArray\(payload\.records\)/);
  assert.match(shellSource, /Array\.isArray\(payload\.list\)/);
  assert.match(shellSource, /Array\.isArray\(payload\.rows\)/);
  assert.match(shellSource, /Array\.isArray\(payload\.data\)/);
  assert.match(shellSource, /payload\.total \?\? payload\.count \?\? payload\.totalCount \?\? payload\.recordTotal/);
  assert.match(shellSource, /const result = toStudyRecordsPayload\(unwrapEnvelope\(response\)\)/);
  assert.doesNotMatch(shellSource, /Array\.isArray\(result\.records\)[\s\S]*: \[\]/);
});
