import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("exam module exposes online exam helpers with explicit exam identifiers", async () => {
  const examModule = await import("./exam.ts");

  assert.equal(typeof examModule.startOnlineExam, "function");
  assert.equal(typeof examModule.getOnlineExamDetail, "function");
  assert.equal(typeof examModule.getOnlineExamAnswerCache, "function");
  assert.equal(typeof examModule.cacheOnlineExamAnswers, "function");
  assert.equal(typeof examModule.submitOnlineExam, "function");
});

test("root api entry re-exports exam APIs", async () => {
  const indexSource = await readFile(
    new URL("../index.ts", import.meta.url),
    "utf8"
  );

  assert.match(indexSource, /export \* from "\.\/modules\/exam";/);
});
