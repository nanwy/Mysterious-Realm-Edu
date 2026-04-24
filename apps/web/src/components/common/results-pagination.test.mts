import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const paginationSource = readFileSync(new URL("./results-pagination.tsx", import.meta.url), "utf8");

test("results pagination uses shared ui pagination primitives", () => {
  assert.match(paginationSource, /Pagination/);
  assert.match(paginationSource, /PaginationContent/);
  assert.match(paginationSource, /PaginationItem/);
  assert.match(paginationSource, /PaginationLink/);
  assert.match(paginationSource, /PaginationPrevious/);
  assert.match(paginationSource, /PaginationNext/);
});
