import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const loginFormSource = readFileSync(join(currentDir, "login-form.tsx"), "utf8");

test("login form uses shadcn field composition", () => {
  assert.match(loginFormSource, /FieldGroup/);
  assert.match(loginFormSource, /FieldLabel/);
  assert.match(loginFormSource, /FieldDescription/);
  assert.match(loginFormSource, /FieldError/);
});

test("login form uses TanStack Form instead of local useState field state", () => {
  assert.doesNotMatch(loginFormSource, /useState/);
  assert.match(loginFormSource, /useForm/);
  assert.match(loginFormSource, /form\.Field/);
  assert.match(loginFormSource, /field\.handleBlur/);
});
