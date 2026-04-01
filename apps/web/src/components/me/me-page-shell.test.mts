import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const mePageShellSource = readFileSync(new URL("./me-page-shell.tsx", import.meta.url), "utf8");
const meNavigationSource = readFileSync(new URL("./me-navigation.ts", import.meta.url), "utf8");

test("me page shell renders primary navigation groups", () => {
  assert.match(mePageShellSource, /data-testid="me-overview-section"/);
  assert.match(meNavigationSource, /账户设置/);
  assert.match(meNavigationSource, /学习与考试/);
  assert.match(meNavigationSource, /订单与服务/);
  assert.match(meNavigationSource, /证书与消息/);
});

test("me page shell includes core student center entries", () => {
  assert.match(meNavigationSource, /个人信息/);
  assert.match(meNavigationSource, /我的课程/);
  assert.match(meNavigationSource, /我的考试/);
  assert.match(meNavigationSource, /我的订单/);
  assert.match(meNavigationSource, /已购商品/);
  assert.match(meNavigationSource, /学习记录/);
  assert.match(meNavigationSource, /练习记录/);
  assert.match(meNavigationSource, /考试成绩/);
  assert.match(meNavigationSource, /我的证书/);
  assert.match(meNavigationSource, /消息中心/);
});
