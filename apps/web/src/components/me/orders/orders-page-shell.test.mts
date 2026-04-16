import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "orders-page-shell.tsx"), "utf8");

test("orders page shell keeps filters, list region, status labels, and operations structure", () => {
  assert.match(shellSource, /data-testid="orders-filter-tabs"/);
  assert.match(shellSource, /data-testid="orders-search-region"/);
  assert.match(shellSource, /data-testid="orders-list-region"/);
  assert.match(shellSource, /data-testid="orders-actions"/);
  assert.match(shellSource, /全部订单/);
  assert.match(shellSource, /待付款/);
  assert.match(shellSource, /订单详情待迁移/);
  assert.match(shellSource, /支付链路待迁移/);
  assert.match(shellSource, /getOrderList/);
  assert.match(shellSource, /ResultsPagination/);
});
