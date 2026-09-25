const test = require("node:test");
const assert = require("node:assert/strict");

const { validatePlanPayload } = require("../src/controllers/planController");

test("plan payload accepts a valid monthly plan", () => {
  const result = validatePlanPayload({
    name: "Synex Pro Monthly",
    code: "pro-monthly",
    price: 19.99,
    currency: "azn",
    billingPeriod: "MONTHLY",
  });

  assert.equal(result.error, undefined);
  assert.equal(result.data.name, "Synex Pro Monthly");
  assert.equal(result.data.code, "pro-monthly");
  assert.equal(result.data.price, 19.99);
  assert.equal(result.data.currency, "AZN");
  assert.equal(result.data.billingPeriod, "MONTHLY");
});

test("plan payload rejects a missing name", () => {
  const result = validatePlanPayload({
    code: "pro-monthly",
    price: 19.99,
    billingPeriod: "MONTHLY",
  });

  assert.ok(result.error);
});

test("plan payload rejects a missing code", () => {
  const result = validatePlanPayload({
    name: "Synex Pro Monthly",
    price: 19.99,
    billingPeriod: "MONTHLY",
  });

  assert.ok(result.error);
});

test("plan payload rejects a negative price", () => {
  const result = validatePlanPayload({
    name: "Synex Pro Monthly",
    code: "pro-monthly",
    price: -5,
    billingPeriod: "MONTHLY",
  });

  assert.ok(result.error);
});

test("plan payload rejects a non-numeric price", () => {
  const result = validatePlanPayload({
    name: "Synex Pro Monthly",
    code: "pro-monthly",
    price: "free",
    billingPeriod: "MONTHLY",
  });

  assert.ok(result.error);
});

test("plan payload rejects an invalid billing period", () => {
  const result = validatePlanPayload({
    name: "Synex Pro Monthly",
    code: "pro-monthly",
    price: 19.99,
    billingPeriod: "WEEKLY",
  });

  assert.ok(result.error);
});

test("plan payload rejects a malformed currency code", () => {
  const result = validatePlanPayload({
    name: "Synex Pro Monthly",
    code: "pro-monthly",
    price: 19.99,
    currency: "azerbaijani-manat",
    billingPeriod: "MONTHLY",
  });

  assert.ok(result.error);
});

test("partial plan payload (update) allows omitting unrelated fields", () => {
  const result = validatePlanPayload(
    { active: false },
    { partial: true },
  );

  assert.equal(result.error, undefined);
  assert.equal(result.data.active, false);
  assert.equal(result.data.name, undefined);
});

test("partial plan payload (update) still rejects an invalid supplied price", () => {
  const result = validatePlanPayload(
    { price: -1 },
    { partial: true },
  );

  assert.ok(result.error);
});