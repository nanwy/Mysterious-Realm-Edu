import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const loginFormSource = readFileSync(join(currentDir, "login-form.tsx"), "utf8");

test("login form uses shadcn field composition", () => {
  assert.match(loginFormSource, /FieldGroup/);
  assert.match(loginFormSource, /FieldLabel/);
  assert.match(loginFormSource, /FieldDescription/);
  assert.match(loginFormSource, /FieldError/);
});
