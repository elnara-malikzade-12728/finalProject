const test = require("node:test");
const assert = require("node:assert/strict");

const { createOneTimeToken, hashToken } = require("../src/services/authTokenService");
const { frontendUrl } = require("../src/services/emailService");
const bcrypt = require("bcrypt");
const { passwordMatchesHash } = require("../src/services/passwordService");
const { scheduleBackgroundTask } = require("../src/services/backgroundTaskService");

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

test("password reset detects reuse of the current password", async () => {
  const hash = await bcrypt.hash("ExistingPassword1", 4);
  assert.equal(await passwordMatchesHash("ExistingPassword1", hash), true);
  assert.equal(await passwordMatchesHash("DifferentPassword1", hash), false);
});

test("background email delivery is registered without awaiting SMTP", async () => {
  let complete;
  const delivery = new Promise((resolve) => { complete = resolve; });
  let registered;

  scheduleBackgroundTask(delivery, (promise) => { registered = promise; });

  assert.equal(registered, delivery);
  complete();
  await registered;
});
