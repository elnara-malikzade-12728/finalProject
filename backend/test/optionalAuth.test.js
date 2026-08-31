const test = require("node:test");
const assert = require("node:assert/strict");
const optionalAuth = require("../src/middleware/optionalAuth");
const { createOptionalAuth } = optionalAuth;

function responseThatMustNotBeUsed() {
  return {
    status() {
      assert.fail("optionalAuth must not return an authentication error");
    },
  };
}

test("optionalAuth continues anonymously without a token", async () => {
  const req = { headers: {} };
  let nextCalls = 0;

  await optionalAuth(req, responseThatMustNotBeUsed(), () => { nextCalls += 1; });

  assert.equal(nextCalls, 1);
  assert.equal(req.user, undefined);
});

test("optionalAuth continues anonymously for a malformed token header", async () => {
  const req = { headers: { authorization: "not-a-bearer-token" } };
  let nextCalls = 0;

  await optionalAuth(req, responseThatMustNotBeUsed(), () => { nextCalls += 1; });

  assert.equal(nextCalls, 1);
  assert.equal(req.user, undefined);
});

test("optionalAuth continues anonymously for an expired or invalid token", async () => {
  const middleware = createOptionalAuth({ verify() { throw new Error("expired"); } }, {});
  const req = { headers: { authorization: "Bearer expired-token" } };
  let nextCalls = 0;

  await middleware(req, responseThatMustNotBeUsed(), () => { nextCalls += 1; });

  assert.equal(nextCalls, 1);
  assert.equal(req.user, undefined);
});

test("optionalAuth attaches a currently valid user", async () => {
  const user = { id: "user-1", role: "USER", isActive: true, tokenVersion: 3 };
  const middleware = createOptionalAuth(
    { verify: () => ({ userId: user.id, tokenVersion: 3 }) },
    { user: { findUnique: async () => user } },
  );
  const req = { headers: { authorization: "Bearer valid-token" } };
  let nextCalls = 0;

  await middleware(req, responseThatMustNotBeUsed(), () => { nextCalls += 1; });

  assert.equal(nextCalls, 1);
  assert.deepEqual(req.user, user);
});

test("optionalAuth ignores a revoked token and continues anonymously", async () => {
  const middleware = createOptionalAuth(
    { verify: () => ({ userId: "user-1", tokenVersion: 1 }) },
    { user: { findUnique: async () => ({ id: "user-1", role: "USER", isActive: true, tokenVersion: 2 }) } },
  );
  const req = { headers: { authorization: "Bearer revoked-token" } };
  let nextCalls = 0;

  await middleware(req, responseThatMustNotBeUsed(), () => { nextCalls += 1; });

  assert.equal(nextCalls, 1);
  assert.equal(req.user, undefined);
});
