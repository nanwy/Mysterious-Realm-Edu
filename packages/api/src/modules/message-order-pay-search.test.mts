import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const modules = ["message", "order", "pay", "search"] as const;

test("message, order, pay and search modules expose only typed factories", async () => {
  const [messageModule, orderModule, payModule, searchModule] = await Promise.all([
    import("./message.ts"),
    import("./order.ts"),
    import("./pay.ts"),
    import("./search.ts"),
  ]);

  assert.equal(typeof messageModule.createMessageApi, "function");
  assert.equal(messageModule.getSystemMessageList, undefined);
  assert.equal(messageModule.getAnnouncementList, undefined);

  assert.equal(typeof orderModule.createOrderApi, "function");
  assert.equal(orderModule.getOrderList, undefined);
  assert.equal(orderModule.selectPurchaseCourseList, undefined);

  assert.equal(typeof payModule.createPayApi, "function");
  assert.equal(payModule.payResult, undefined);

  assert.equal(typeof searchModule.createSearchApi, "function");
  assert.equal(searchModule.getSearchList, undefined);
  assert.equal(searchModule.getMySearchHistory, undefined);
});

test("pay response type is narrowed from Java payment implementations", async () => {
  const source = await readFile(new URL("../types/pay.ts", import.meta.url), "utf8");

  assert.match(source, /export type PaymentResponse =/);
  assert.match(source, /WechatH5PaymentResponse/);
  assert.match(source, /WechatRequestPaymentResponse/);
  assert.doesNotMatch(source, /PaymentResponse = unknown/);
});

for (const moduleName of modules) {
  test(`${moduleName} module uses explicit API contract types`, async () => {
    const source = await readFile(
      new URL(`./${moduleName}.ts`, import.meta.url),
      "utf8"
    );

    assert.match(source, new RegExp(`\\.\\./types/${moduleName}`));
    assert.doesNotMatch(source, /Record<string, unknown>/);
    assert.doesNotMatch(source, /createApiClient/);
    assert.doesNotMatch(source, /default[A-Z][A-Za-z]+Api/);
  });

  test(`api types entry re-exports ${moduleName} contracts`, async () => {
    const source = await readFile(
      new URL("../types/index.ts", import.meta.url),
      "utf8"
    );

    assert.match(source, new RegExp(`export \\* from "\\./${moduleName}";`));
  });
}
