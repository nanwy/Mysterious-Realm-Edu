import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "messages-page-shell.tsx"), "utf8");

test("messages page shell keeps tabs, list region, and pagination structure", () => {
  assert.match(shellSource, /data-testid="messages-tabs"/);
  assert.match(shellSource, /data-testid="messages-list"|data-testid="messages-list-region"/);
  assert.match(shellSource, /data-testid="messages-pagination"/);
  assert.match(shellSource, /系统消息/);
  assert.match(shellSource, /业务消息/);
  assert.match(shellSource, /ResultsPagination/);
  assert.match(shellSource, /getSystemMessageList/);
  assert.match(shellSource, /getBusinessMessageList/);
});
