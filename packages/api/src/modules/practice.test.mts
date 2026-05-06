import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("practice module exposes only the typed factory", async () => {
  const practiceModule = await import("./practice.ts");

  assert.equal(typeof practiceModule.createPracticeApi, "function");
  assert.equal(practiceModule.getRepositoryList, undefined);
  assert.equal(practiceModule.getRepositoryById, undefined);
  assert.equal(practiceModule.getRecentPractice, undefined);
});

test("practice module uses explicit API contract types", async () => {
  const source = await readFile(
    new URL("./practice.ts", import.meta.url),
    "utf8"
  );

  assert.match(source, /PracticeRepositoryListRequest/);
  assert.match(source, /UserPracticeSubmitRequest/);
  assert.doesNotMatch(source, /Record<string, unknown>/);
  assert.doesNotMatch(source, /createApiClient/);
  assert.doesNotMatch(source, /defaultPracticeApi/);
});

test("api types entry re-exports practice contracts", async () => {
  const source = await readFile(
    new URL("../types/index.ts", import.meta.url),
    "utf8"
  );

  assert.match(source, /export \* from "\.\/practice";/);
});
