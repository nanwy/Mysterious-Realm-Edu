import assert from "node:assert/strict";
import test from "node:test";

import {
  getFailureMessage,
  loginFormSchema,
  loginValuesSchema,
  validateLoginValues,
} from "./login-form.logic";

test("getFailureMessage uses error messages when available", () => {
  assert.equal(getFailureMessage(new Error("验证码错误")), "验证码错误");
});

test("getFailureMessage falls back to a product message for unknown failures", () => {
  assert.equal(getFailureMessage("network"), "登录失败，请稍后重试。");
});

test("loginValuesSchema trims submitted login values", () => {
  assert.deepEqual(
    loginValuesSchema.parse({
      username: "  student  ",
      password: "  pass123  ",
      key: "  9k2x  ",
    }),
    {
      username: "student",
      password: "pass123",
      key: "9k2x",
    }
  );
});

test("validateLoginValues returns zod field messages", () => {
  assert.deepEqual(
    validateLoginValues({
      username: "   ",
      password: "secret",
      key: "",
    }),
    {
      username: "请输入用户名或手机号",
      key: "请输入安全校验码",
    }
  );
});

test("loginFormSchema accepts form feedback state alongside login fields", () => {
  assert.deepEqual(
    loginFormSchema.parse({
      username: "student",
      password: "pass123",
      key: "9k2x",
      feedbackMessage: "登录成功",
      feedbackTone: "success",
    }),
    {
      username: "student",
      password: "pass123",
      key: "9k2x",
      feedbackMessage: "登录成功",
      feedbackTone: "success",
    }
  );
});
