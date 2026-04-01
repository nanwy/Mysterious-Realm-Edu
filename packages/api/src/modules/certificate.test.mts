import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("certificate module exposes the expected certificate APIs", async () => {
  const certificateModule = await import("./certificate.ts");

  assert.equal(typeof certificateModule.generateCertificate, "function");
  assert.equal(typeof certificateModule.getUserCertificate, "function");
  assert.equal(typeof certificateModule.getUserCertificateList, "function");
});

test("root api entry re-exports certificate APIs", async () => {
  const indexSource = await readFile(
    new URL("../index.ts", import.meta.url),
    "utf8"
  );

  assert.match(indexSource, /export \* from "\.\/modules\/certificate";/);
});
