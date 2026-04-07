import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "me-page-shell.tsx"), "utf8");
const dataSource = readFileSync(join(currentDir, "me-data.ts"), "utf8");
const motionSource = readFileSync(join(currentDir, "../../../../../packages/motion/src/reveal.tsx"), "utf8");

test("me page shell renders portal hero, navigation, and grouped sections", () => {
  assert.match(shellSource, /data-testid="me-portal-hero"/);
  assert.match(shellSource, /data-testid="me-priority-actions"/);
  assert.match(shellSource, /data-testid="me-layout"/);
  assert.match(shellSource, /Student Portal/);
  assert.match(shellSource, /页面主用途/);
  assert.match(shellSource, /个人中心导航/);
  assert.match(shellSource, /全部入口分区/);
  assert.match(shellSource, /MeNavigation/);
  assert.match(shellSource, /MeSectionGrid/);
});

test("me page shell prioritizes portal hero before navigation map and grouped sections", () => {
  assert.doesNotMatch(shellSource, /<MotionStagger/);
  assert.match(shellSource, /data-testid="me-portal-hero"/);
  assert.match(shellSource, /xl:grid-cols-\[minmax\(0,1\.45fr\)_320px\]/);
  assert.match(shellSource, /保留完整旧站分组，桌面端作为门户地图固定在右侧/);
  assert.match(shellSource, /形成从“先处理什么”到“还有哪些入口”的稳定阅读路径/);
  assert.match(shellSource, /阅读顺序/);
});

test("motion reveal primitives keep viewport-driven reveal behavior with reduced-motion fallback", () => {
  assert.match(motionSource, /initial="hidden"/);
  assert.match(motionSource, /whileInView="show"/);
  assert.match(motionSource, /viewport=\{\{ once, amount \}\}/);
  assert.match(motionSource, /const reduce = useReducedMotion\(\);/);
  assert.match(motionSource, /transition: Transition = reduce/);
  assert.match(motionSource, /variants=\{reduce \? revealVariants\("none", 0\) : revealVariants\(direction, distance\)\}/);
});

test("me page data keeps the migrated personal center entries from the legacy site", () => {
  assert.match(dataSource, /基本设置/);
  assert.match(dataSource, /个人信息/);
  assert.match(dataSource, /账号安全/);
  assert.match(dataSource, /我的课程/);
  assert.match(dataSource, /我的考试/);
  assert.match(dataSource, /我的订单/);
  assert.match(dataSource, /已购商品/);
  assert.match(dataSource, /课程学习/);
  assert.match(dataSource, /学习进度/);
  assert.match(dataSource, /学习记录/);
  assert.match(dataSource, /练习记录/);
  assert.match(dataSource, /考试成绩/);
  assert.match(dataSource, /我的证书/);
  assert.match(dataSource, /消息中心/);
});
