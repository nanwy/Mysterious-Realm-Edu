import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("news module uses explicit API contract types", async () => {
  const source = await readFile(new URL("./news.ts", import.meta.url), "utf8");

  assert.match(source, /NewsListRequest/);
  assert.doesNotMatch(source, /Record<string, unknown>/);
  assert.doesNotMatch(source, /createApiClient/);
  assert.doesNotMatch(source, /defaultNewsApi/);
  assert.doesNotMatch(source, /export function (searchNewsList|getNewsList|getNewsDetail|listHotNews)/);
});

test("api types entry re-exports news contracts", async () => {
  const source = await readFile(
    new URL("../types/index.ts", import.meta.url),
    "utf8"
  );

  assert.match(source, /export \* from "\.\/news";/);
});
