import assert from "node:assert/strict";
import test from "node:test";

import {
  extractToken,
  getSuccessMessage,
  validateLoginValues,
} from "./login-form.logic.ts";

test("validateLoginValues reports missing required fields", () => {
  assert.deepEqual(validateLoginValues({ username: "", password: "", key: "" }), {
    username: "请输入用户名或手机号",
    password: "请输入密码",
    key: "请输入安全校验码",
  });
});

test("validateLoginValues trims values before validating", () => {
  assert.deepEqual(
    validateLoginValues({
      username: "  learner  ",
      password: " 123456 ",
      key: "  verify-key ",
    }),
    {}
  );
});

test("extractToken returns the first supported token field", () => {
  assert.equal(extractToken({ accessToken: "access-token" }), "access-token");
  assert.equal(extractToken({ id_token: "id-token" }), "id-token");
});

test("getSuccessMessage returns a success prompt when a token is present", () => {
  assert.equal(
    getSuccessMessage({ token: "abc123" }),
    "登录成功，欢迎回到云学考。"
  );
});

test("getSuccessMessage explains successful responses without a token", () => {
  assert.equal(
    getSuccessMessage({ userId: "42" }),
    "登录成功，正在为你同步学习数据。"
  );
});
