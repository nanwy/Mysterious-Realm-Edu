import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "news-page-shell.tsx"), "utf8");
const recommendedSource = readFileSync(join(currentDir, "news-recommended-section.tsx"), "utf8");
const searchSource = readFileSync(join(currentDir, "news-search-form.tsx"), "utf8");
const resultsSource = readFileSync(join(currentDir, "news-results.tsx"), "utf8");

test("news page shell composes recommended, search, results, hot sidebar, and pagination", () => {
  assert.match(shellSource, /NewsRecommendedSection/);
  assert.match(shellSource, /NewsSearchForm/);
  assert.match(shellSource, /NewsResults/);
  assert.match(shellSource, /NewsHotSidebar/);
  assert.match(shellSource, /ResultsPagination/);
});

test("news page shell exposes required structural hooks", () => {
  assert.match(recommendedSource, /data-testid="news-recommended-section"/);
  assert.match(searchSource, /data-testid="news-search-section"/);
  assert.match(shellSource, /data-testid="news-list-section"/);
  assert.match(shellSource, /data-testid="news-pagination-section"/);
});

test("news results preserve loading, empty, and error states", () => {
  assert.match(resultsSource, /data-state="loading"/);
  assert.match(resultsSource, /data-state="empty"/);
  assert.match(resultsSource, /data-state="error"/);
});
