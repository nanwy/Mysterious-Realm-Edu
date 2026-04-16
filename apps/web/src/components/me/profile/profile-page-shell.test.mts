import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "profile-page-shell.tsx"), "utf8");
const contentSource = readFileSync(join(currentDir, "profile-page-content.tsx"), "utf8");

test("profile page shell keeps the migrated profile, contact, and department sections", () => {
  assert.match(shellSource, /ProfileSummary/);
  assert.match(shellSource, /InfoSection/);
  assert.match(contentSource, /title: "详细资料"/);
  assert.match(contentSource, /title: "联系信息"/);
  assert.match(contentSource, /title: "当前部门"/);
  assert.match(contentSource, /testId: "profile-details-section"/);
  assert.match(contentSource, /testId: "profile-contact-section"/);
  assert.match(contentSource, /testId: "profile-department-section"/);
});

test("profile empty state is derived from raw profile data instead of fallback labels", () => {
  assert.match(contentSource, /function hasProfileContent\(/);
  assert.match(contentSource, /if \(!hasProfileContent\(profile, currentDept, result\)\)/);
  assert.doesNotMatch(
    contentSource,
    /summaryValues\.some\(\(value\) => value && !value\.includes\("暂无"\) && !value\.includes\("未填写"\)\)/
  );
});
