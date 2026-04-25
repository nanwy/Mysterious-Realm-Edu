import assert from "node:assert/strict";
import test from "node:test";
import { buildQuery } from "./endpoint.ts";

test("buildQuery omits empty values and encodes present values", () => {
  assert.equal(
    buildQuery({
      id: 12,
      keyword: "期末 考试",
      empty: "",
      missing: undefined,
      nil: null,
      active: false,
    }),
    "?id=12&keyword=%E6%9C%9F%E6%9C%AB+%E8%80%83%E8%AF%95&active=false"
  );
});

test("buildQuery returns an empty string when no values remain", () => {
  assert.equal(buildQuery({ empty: "", missing: undefined, nil: null }), "");
});
