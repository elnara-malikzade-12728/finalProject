const test = require("node:test");
const assert = require("node:assert/strict");

const { PrismaRateLimitStore } = require("../src/middleware/prismaRateLimitStore");

test("distributed rate-limit keys are isolated by limiter prefix", async () => {
  let query;
  const db = {
    $queryRaw: async (statement) => {
      query = statement;
      return [{ count: 3, resetAt: new Date("2030-01-01T00:00:00Z") }];
    },
  };
  const store = new PrismaRateLimitStore("login", db);
  store.init({ windowMs: 60_000 });

  const result = await store.increment("account:user@example.com");

  assert.equal(result.totalHits, 3);
  assert.ok(result.resetTime instanceof Date);
  assert.ok(query.values.includes("login:account:user@example.com"));
});
