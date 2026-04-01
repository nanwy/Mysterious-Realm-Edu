import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const paginationSource = readFileSync(
  new URL("./practice-pagination.tsx", import.meta.url),
  "utf8"
);

test("practice pagination uses shared pagination primitives", () => {
  assert.match(paginationSource, /Pagination/);
  assert.match(paginationSource, /PaginationContent/);
  assert.match(paginationSource, /PaginationItem/);
  assert.match(paginationSource, /PaginationLink/);
  assert.match(paginationSource, /PaginationPrevious/);
  assert.match(paginationSource, /PaginationNext/);
});
