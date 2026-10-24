const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { resolveAsset, externalURL } = require("./security.cjs");
const root = path.resolve("dist");
test("bundled files stay inside the application asset root", () => {
  assert.equal(
    resolveAsset(root, "study://app/index.html"),
    path.join(root, "index.html"),
  );
  assert.equal(
    resolveAsset(root, "study://app/assets/index.js"),
    path.join(root, "assets", "index.js"),
  );
  for (const value of [
    "file:///etc/passwd",
    "https://example.org/index.html",
    "study://other/index.html",
    "study://app/%2e%2e%2foutside",
    "study://app/%5c..%5csecret",
    "study://app/%00",
    "study://user:password@app/index.html",
    "study://app/%E0%A4%A",
  ])
    assert.equal(resolveAsset(root, value), null, value);
});
test("external links allow only ordinary web URLs", () => {
  assert.equal(externalURL("https://fipi.ru/ege"), "https://fipi.ru/ege");
  for (const url of [
    "file:///etc/passwd",
    "javascript:alert(1)",
    "data:text/html,x",
    "study://app/index.html",
    "https://user:secret@example.org",
    "not a url",
  ])
    assert.equal(externalURL(url), null, url);
});
