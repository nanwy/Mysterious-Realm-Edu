import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "orders-page-shell.tsx"), "utf8");

test("orders page shell keeps filters, list region, and detail entry structure", () => {
  assert.match(shellSource, /data-testid="orders-filters"/);
  assert.match(shellSource, /data-testid="orders-list"|data-testid="orders-list-region"/);
  assert.match(shellSource, /data-testid="orders-detail-entry"/);
  assert.match(shellSource, /全部订单/);
  assert.match(shellSource, /待付款/);
  assert.match(shellSource, /待评价/);
  assert.match(shellSource, /已完成/);
  assert.match(shellSource, /查看订单详情/);
  assert.match(shellSource, /ResultsPagination/);
  assert.match(shellSource, /getOrderList/);
});
