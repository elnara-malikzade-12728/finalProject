const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

test("sensitive query tokens are removed without dropping unrelated URL state", async () => {
  const moduleUrl = pathToFileURL(path.resolve(__dirname, "../../career-platform/src/utils/urlSecurity.js"));
  const { removeQueryParameterFromUrl } = await import(moduleUrl.href);
  const calls = [];
  const location = { href: "https://academy.test/verify-email?token=secret&email=user%40example.com#status" };
  const history = { state: { navigation: 1 }, replaceState: (...args) => calls.push(args) };

  assert.equal(removeQueryParameterFromUrl("token", location, history), true);
  assert.deepEqual(calls, [[{ navigation: 1 }, "", "/verify-email?email=user%40example.com#status"]]);
});

test("URL history is unchanged when the sensitive parameter is absent", async () => {
  const moduleUrl = pathToFileURL(path.resolve(__dirname, "../../career-platform/src/utils/urlSecurity.js"));
  const { removeQueryParameterFromUrl } = await import(moduleUrl.href);
  let called = false;
  const history = { state: null, replaceState: () => { called = true; } };

  assert.equal(removeQueryParameterFromUrl("token", { href: "https://academy.test/login" }, history), false);
  assert.equal(called, false);
});
