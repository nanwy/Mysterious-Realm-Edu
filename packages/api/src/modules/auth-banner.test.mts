import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("auth and banner modules expose only typed factories", async () => {
  const [authModule, bannerModule] = await Promise.all([
    import("./auth.ts"),
    import("./banner.ts"),
  ]);

  assert.equal(typeof authModule.createAuthApi, "function");
  assert.equal(authModule.login, undefined);
  assert.equal(authModule.getCaptcha, undefined);

  assert.equal(typeof bannerModule.createBannerApi, "function");
  assert.equal(bannerModule.getBannerList, undefined);
});

for (const moduleName of ["auth", "banner"] as const) {
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
