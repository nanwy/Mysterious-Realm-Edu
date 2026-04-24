import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const newsDetailShellSource = readFileSync(
  new URL("./news-detail-page-shell.tsx", import.meta.url),
  "utf8"
);

test("news detail shell renders title and metadata section", () => {
  assert.match(newsDetailShellSource, /data-testid="news-detail-title-section"/);
  assert.match(newsDetailShellSource, /文章详情/);
  assert.match(newsDetailShellSource, /正文内容/);
});

test("news detail shell renders readable content container", () => {
  assert.match(newsDetailShellSource, /data-testid="news-detail-content-section"/);
  assert.match(newsDetailShellSource, /data-testid="news-detail-body"/);
  assert.match(newsDetailShellSource, /dangerouslySetInnerHTML/);
});
