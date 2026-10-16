const test = require("node:test");
const assert = require("node:assert/strict");

const { isAttemptExpired } = require("../src/controllers/attemptController");

test("timed attempts expire at their server-calculated deadline", () => {
  const attempt = {
    startedAt: "2026-10-16T08:00:00.000Z",
    test: { timeLimitMinutes: 5 },
  };

  assert.equal(isAttemptExpired(attempt, Date.parse("2026-10-16T08:04:59.999Z")), false);
  assert.equal(isAttemptExpired(attempt, Date.parse("2026-10-16T08:05:00.000Z")), true);
});

test("untimed attempts are not treated as stale", () => {
  assert.equal(isAttemptExpired({ startedAt: new Date(0), test: { timeLimitMinutes: null } }, Date.now()), false);
});

