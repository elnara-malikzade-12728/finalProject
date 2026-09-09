const test = require("node:test");
const assert = require("node:assert/strict");

const {
  accountLimitKey,
  getTrustedClientIp,
} = require("../src/middleware/rateLimiters");

function request({ ip = "127.0.0.1", email, headers = {} } = {}) {
  const normalizedHeaders = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  );

  return {
    ip,
    body: email === undefined ? {} : { email },
    socket: { remoteAddress: ip },
    get(name) {
      return normalizedHeaders[name.toLowerCase()];
    },
  };
}

test("non-Vercel requests ignore client-supplied forwarding headers", () => {
  const previous = process.env.VERCEL;
  delete process.env.VERCEL;
  try {
    const req = request({
      ip: "203.0.113.10",
      headers: {
        "x-forwarded-for": "198.51.100.20",
        "x-vercel-forwarded-for": "192.0.2.30",
      },
    });

    assert.equal(getTrustedClientIp(req), "203.0.113.10");
  } finally {
    if (previous === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previous;
  }
});

test("Vercel requests use the platform-normalized client IP", () => {
  const previous = process.env.VERCEL;
  process.env.VERCEL = "1";
  try {
    const req = request({
      ip: "127.0.0.1",
      headers: { "x-vercel-forwarded-for": "203.0.113.10, 10.0.0.1" },
    });

    assert.equal(getTrustedClientIp(req), "203.0.113.10");
  } finally {
    if (previous === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previous;
  }
});

test("account-sensitive limits cannot be reset by changing an IP header", () => {
  const first = request({
    email: " User@Example.com ",
    headers: { "x-forwarded-for": "198.51.100.1" },
  });
  const second = request({
    email: "user@example.com",
    headers: { "x-forwarded-for": "198.51.100.99" },
  });

  assert.equal(accountLimitKey(first), "account:user@example.com");
  assert.equal(accountLimitKey(second), accountLimitKey(first));
});
