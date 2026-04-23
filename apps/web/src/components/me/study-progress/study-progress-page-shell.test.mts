import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { normalizeStudyProgressListPayload } from "./study-progress-payload.ts";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "study-progress-page-shell.tsx"), "utf8");

test("study progress page shell keeps filter, overview, list, and pagination structure", () => {
  assert.match(shellSource, /data-testid="study-progress-filter-section"/);
  assert.match(shellSource, /data-testid="study-progress-overview"/);
  assert.match(shellSource, /data-testid="study-progress-list"|data-testid="study-progress-list-region"/);
  assert.match(shellSource, /data-testid="study-progress-pagination"/);
});

test("study progress payload normalization accepts common paged list shapes", () => {
  const cases = [
    { payload: { records: [{ id: "records" }], total: 11 }, id: "records", total: 11 },
    { payload: { list: [{ id: "list" }], count: "12" }, id: "list", total: 12 },
    { payload: { rows: [{ id: "rows" }], totalCount: 13 }, id: "rows", total: 13 },
    { payload: { data: [{ id: "data" }] }, id: "data", total: 1 },
  ];

  for (const item of cases) {
    const result = normalizeStudyProgressListPayload(item.payload);

    assert.equal(result.records.length, 1);
    assert.equal((result.records[0] as { id: string }).id, item.id);
    assert.equal(result.total, item.total);
  }
});
