const test = require("node:test");
const assert = require("node:assert/strict");

const { createOneTimeToken, hashToken } = require("../src/services/authTokenService");
const { frontendUrl } = require("../src/services/emailService");

test("one-time tokens are random and only their hashes need persistence", () => {
  const first = createOneTimeToken();
  const second = createOneTimeToken();
  assert.notEqual(first.token, second.token);
  assert.equal(first.hash, hashToken(first.token));
  assert.notEqual(first.hash, first.token);
});

test("email action links encode tokens and use the configured frontend", () => {
  const previous = process.env.FRONTEND_URL;
  process.env.FRONTEND_URL = "https://example.test/";
  assert.equal(frontendUrl("/reset-password", "a+b"), "https://example.test/reset-password?token=a%2Bb");
  if (previous === undefined) delete process.env.FRONTEND_URL;
  else process.env.FRONTEND_URL = previous;
});
