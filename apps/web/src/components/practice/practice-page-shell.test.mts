import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "practice-page-shell.tsx"), "utf8");
const listSource = readFileSync(join(currentDir, "practice-repository-list.tsx"), "utf8");
const dataSource = readFileSync(join(currentDir, "practice-data.ts"), "utf8");

test("practice page shell composes search, list, and pagination modules", () => {
  assert.match(shellSource, /PracticeSearchForm/);
  assert.match(shellSource, /PracticeRepositoryList/);
  assert.match(shellSource, /ResultsPagination/);
});

test("practice page shell preserves loading, empty, and error states", () => {
  assert.match(listSource, /data-state="loading"/);
  assert.match(listSource, /data-state="empty"/);
  assert.match(listSource, /data-state="error"/);
  assert.match(dataSource, /getRepositoryList/);
  assert.match(shellSource, /fetchPracticeRepositories/);
});

test("practice page shell keeps repository loading in a cancellable effect", () => {
  assert.doesNotMatch(shellSource, /useEffectEvent/);
  assert.match(shellSource, /let cancelled = false;/);
  assert.match(shellSource, /if \(cancelled\) \{/);
  assert.match(shellSource, /return \(\) => \{/);
  assert.match(shellSource, /cancelled = true;/);
});
