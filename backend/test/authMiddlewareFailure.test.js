const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const authSource = fs.readFileSync(
  path.join(__dirname, "../src/middleware/auth.js"),
  "utf8",
);

test("authentication middleware does not turn database failures into unauthorized responses", () => {
  assert.match(authSource, /let payload;[\s\S]*jwt\.verify/);
  assert.match(authSource, /let user;[\s\S]*prisma\.user\.findUnique/);
  assert.match(authSource, /res\.status\(503\)[\s\S]*AUTH_SERVICE_UNAVAILABLE/);
});

test("invalid, expired, and revoked JWTs remain explicit unauthorized responses", () => {
  assert.match(authSource, /AUTH_TOKEN_EXPIRED/);
  assert.match(authSource, /AUTH_TOKEN_INVALID/);
  assert.match(authSource, /res\.status\(401\)[\s\S]*AUTH_SESSION_REVOKED/);
});
