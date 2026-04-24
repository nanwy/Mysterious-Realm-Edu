import { nextJsConfig } from "../../packages/eslint-config/next.js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  { ignores: [".next/"] },
  {
    files: ["**/*.test.{ts,tsx}", "**/test/**/*.{ts,tsx}"],
    rules: {
      "react/display-name": "off",
    },
  },
];
