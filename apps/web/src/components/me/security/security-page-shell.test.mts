import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "security-page-shell.tsx"), "utf8");
const contentSource = readFileSync(join(currentDir, "security-page-content.tsx"), "utf8");

test("security page keeps phone, email, and password modules in the migrated shell", () => {
  assert.match(shellSource, /SecuritySummaryCard/);
  assert.match(shellSource, /SecuritySectionCard/);
  assert.match(contentSource, /title: "手机号"/);
  assert.match(contentSource, /title: "邮箱"/);
  assert.match(contentSource, /title: "密码"/);
  assert.match(contentSource, /testId: "security-phone-section"/);
  assert.match(contentSource, /testId: "security-email-section"/);
  assert.match(contentSource, /testId: "security-password-section"/);
});

test("security page shell distinguishes config, auth, and request failures", () => {
  assert.match(shellSource, /case "config_missing"/);
  assert.match(shellSource, /case "unauthorized"/);
  assert.match(shellSource, /case "request_failed"/);
});
