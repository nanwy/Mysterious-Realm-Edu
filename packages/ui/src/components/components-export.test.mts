import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const indexSource = readFileSync(new URL("../index.ts", import.meta.url), "utf8");

test("ui package exports the common shared primitives", () => {
  assert.match(indexSource, /pagination/);
  assert.match(indexSource, /textarea/);
  assert.match(indexSource, /alert/);
  assert.match(indexSource, /avatar/);
  assert.match(indexSource, /tabs/);
});
