import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "me-page-shell.tsx"), "utf8");
const dataSource = readFileSync(join(currentDir, "me-data.ts"), "utf8");
const motionSource = readFileSync(join(currentDir, "../../../../../packages/motion/src/reveal.tsx"), "utf8");

test("me page shell renders action-first lead, navigation, and grouped sections", () => {
  assert.match(shellSource, /data-testid="me-lead-actions"/);
  assert.match(shellSource, /data-testid="me-layout"/);
  assert.match(shellSource, /个人空间导航/);
  assert.match(shellSource, /入口分组/);
  assert.match(shellSource, /Today Focus/);
  assert.match(shellSource, /MeNavigation/);
  assert.match(shellSource, /MeSectionGrid/);
});

test("me page shell avoids nested parent reveal wrappers around the two-column layout", () => {
  assert.doesNotMatch(shellSource, /<MotionStagger/);
  assert.match(shellSource, /<MotionReveal direction="up">\s*<section/s);
  assert.match(shellSource, /<div\s+className="grid gap-6 xl:grid-cols-\[272px_minmax\(0,1fr\)\]"\s+data-testid="me-layout"/s);
  assert.doesNotMatch(shellSource, /<MotionReveal direction="left"/);
  assert.doesNotMatch(shellSource, /<MotionReveal direction="up" delay=\{0\.06\}>/);
});

test("motion reveal primitives recover visible elements after browser history restore", () => {
  assert.match(motionSource, /window\.addEventListener\("pageshow", handlePageShow\)/);
  assert.match(motionSource, /window\.addEventListener\("popstate", handlePopState\)/);
  assert.match(motionSource, /document\.addEventListener\("visibilitychange", handleVisibilityChange\)/);
  assert.match(motionSource, /requestAnimationFrame\(\(\) => \{\s*recoverIfVisible\(\);\s*window\.requestAnimationFrame\(\(\) => \{\s*recoverIfVisible\(\);/s);
  assert.match(motionSource, /animate=\{isRecovered \? "show" : undefined\}/);
  assert.match(motionSource, /onViewportEnter=\{\(\) => \{\s*markRecovered\(\);/s);
});

test("me page data keeps the migrated personal center entries from the legacy site", () => {
  assert.match(dataSource, /账户与安全/);
  assert.match(dataSource, /个人信息/);
  assert.match(dataSource, /账号安全/);
  assert.match(dataSource, /我的课程/);
  assert.match(dataSource, /我的考试/);
  assert.match(dataSource, /我的订单/);
  assert.match(dataSource, /已购商品/);
  assert.match(dataSource, /学习轨迹/);
  assert.match(dataSource, /学习进度/);
  assert.match(dataSource, /学习记录/);
  assert.match(dataSource, /练习记录/);
  assert.match(dataSource, /考试成绩/);
  assert.match(dataSource, /我的证书/);
  assert.match(dataSource, /消息中心/);
});
