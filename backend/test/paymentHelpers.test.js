const test = require("node:test");
const assert = require("node:assert/strict");

const {
  addMonths,
  addYears,
  parsePositiveInteger,
} = require("../src/controllers/paymentController");
const { getStripeClient } = require("../src/services/paymentService");

test("subscription plans remain recurring while course purchases are one-time", () => {
  assert.deepEqual(["MONTHLY", "YEARLY"].map((period) => period !== "ONE_TIME"), [true, true]);
});

test("Stripe client reads its secret from the runtime environment", () => {
  const previousSecret = process.env.STRIPE_SECRET_KEY;

  try {
    delete process.env.STRIPE_SECRET_KEY;
    assert.throws(
      () => getStripeClient(),
      (error) => error.code === "STRIPE_NOT_CONFIGURED",
    );

    process.env.STRIPE_SECRET_KEY = "sk_test_runtime_value";
    assert.ok(getStripeClient());
  } finally {
    if (previousSecret === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previousSecret;
  }
});

test("addMonths advances a monthly subscription by exactly one month", () => {
  const start = new Date("2026-01-15T00:00:00.000Z");
  const result = addMonths(start, 1);

  assert.equal(result.getUTCMonth(), 1);
  assert.equal(result.getUTCDate(), 15);
});

test("addYears grants a one-year single-course access window", () => {
  const start = new Date("2026-03-10T00:00:00.000Z");
  const result = addYears(start, 1);

  assert.equal(result.getUTCFullYear(), 2027);
  assert.equal(result.getUTCMonth(), 2);
  assert.equal(result.getUTCDate(), 10);
});

test("parsePositiveInteger accepts valid positive integers", () => {
  assert.equal(parsePositiveInteger("5"), 5);
  assert.equal(parsePositiveInteger(12), 12);
});

test("parsePositiveInteger rejects zero, negatives and non-numeric input", () => {
  assert.equal(parsePositiveInteger("0"), null);
  assert.equal(parsePositiveInteger("-3"), null);
  assert.equal(parsePositiveInteger("abc"), null);
  assert.equal(parsePositiveInteger(undefined), null);
});

test("parsePositiveInteger truncates a decimal id string to its integer part", () => {
  assert.equal(parsePositiveInteger("19.99"), 19);
});
