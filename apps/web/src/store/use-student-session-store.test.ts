import assert from "node:assert/strict";
import test from "node:test";

import { useStudentSessionStore } from "./use-student-session-store.ts";

test("student session store keeps login token and user info", () => {
  useStudentSessionStore.getState().clearSession();

  useStudentSessionStore.getState().setSession({
    token: "token-1",
    userInfo: {
      id: "user-1",
      username: "student",
      realname: "Student User",
    },
  });

  const session = useStudentSessionStore.getState();

  assert.equal(session.token, "token-1");
  assert.deepEqual(session.userInfo, {
    id: "user-1",
    username: "student",
    realname: "Student User",
  });
});

test("student session store clears login state", () => {
  useStudentSessionStore.getState().setSession({
    token: "token-1",
    userInfo: {
      id: "user-1",
      username: "student",
    },
  });

  useStudentSessionStore.getState().clearSession();

  const session = useStudentSessionStore.getState();

  assert.equal(session.token, null);
  assert.equal(session.userInfo, null);
});
