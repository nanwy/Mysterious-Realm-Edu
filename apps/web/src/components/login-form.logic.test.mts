import test from "node:test";
import assert from "node:assert/strict";

import {
  extractToken,
  getSuccessMessage,
  validateLoginValues,
} from "./login-form.logic.ts";

test("validateLoginValues reports missing required fields", () => {
  assert.deepEqual(validateLoginValues({ username: "", password: "", key: "" }), {
    username: "请输入用户名或手机号",
    password: "请输入密码",
    key: "请输入验证码 Key",
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
    "登录成功，前端已收到凭证并完成本地保存。"
  );
});

test("getSuccessMessage explains successful responses without a token", () => {
  assert.equal(
    getSuccessMessage({ userId: "42" }),
    "登录接口返回成功，但响应中暂未识别到 token 字段。"
  );
});
