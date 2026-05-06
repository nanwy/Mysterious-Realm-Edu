import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("certificate module exposes the expected certificate APIs", async () => {
  const certificateModule = await import("./certificate.ts");

  assert.equal(typeof certificateModule.createCertificateApi, "function");
  assert.equal(certificateModule.generateCertificate, undefined);
  assert.equal(certificateModule.getUserCertificate, undefined);
  assert.equal(certificateModule.getUserCertificateList, undefined);
});

test("certificate module uses explicit API contract types", async () => {
  const source = await readFile(
    new URL("./certificate.ts", import.meta.url),
    "utf8"
  );

  assert.match(source, /CertificateListRequest/);
  assert.doesNotMatch(source, /Record<string, unknown>/);
  assert.doesNotMatch(source, /createCertificateModule/);
  assert.doesNotMatch(source, /defaultCertificateApi/);
});

test("root api entry re-exports certificate APIs", async () => {
  const indexSource = await readFile(
    new URL("../index.ts", import.meta.url),
    "utf8"
  );

  assert.match(indexSource, /export \* from "\.\/modules\/certificate";/);
});
