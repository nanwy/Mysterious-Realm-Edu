import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const paginationSource = readFileSync(join(currentDir, "practice-pagination.tsx"), "utf8");

test("practice pagination uses shared shadcn pagination primitives", () => {
  assert.match(paginationSource, /PaginationContent/);
  assert.match(paginationSource, /PaginationPrevious/);
  assert.match(paginationSource, /PaginationNext/);
  assert.match(paginationSource, /PaginationLink/);
  assert.doesNotMatch(paginationSource, /import\s+\{\s*Button\s*\}\s+from\s+"@workspace\/ui"/);
});
