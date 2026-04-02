import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "certificates-page-shell.tsx"), "utf8");

test("certificates page shell keeps tabs, list region, and action entry structure", () => {
  assert.match(shellSource, /data-testid="certificates-tabs"/);
  assert.match(shellSource, /data-testid="certificates-list"|data-testid="certificates-list-region"/);
  assert.match(shellSource, /data-testid="certificates-pagination"/);
  assert.match(shellSource, /全部/);
  assert.match(shellSource, /学习证书/);
  assert.match(shellSource, /考试证书/);
  assert.match(shellSource, /预览证书/);
  assert.match(shellSource, /下载证书/);
  assert.match(shellSource, /ResultsPagination/);
  assert.match(shellSource, /getUserCertificateList/);
});
