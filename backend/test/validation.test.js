const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getPasswordValidationError,
  isValidEmail,
  normalizeEmail,
} = require("../src/utils/validation");

test("email is normalized before persistence and lookup", () => {
  assert.equal(
    normalizeEmail("  Test@Example.COM "),
    "test@example.com",
  );
});

test("email validation rejects malformed addresses", () => {
  assert.equal(isValidEmail("user@example.com"), true);
  assert.equal(isValidEmail("invalid-address"), false);
});

test("password policy accepts a strong password", () => {
  assert.equal(
    getPasswordValidationError("StrongPass1"),
    null,
  );
});

test("password policy rejects weak and oversized values", () => {
  assert.ok(getPasswordValidationError("weak"));
  assert.ok(
    getPasswordValidationError(
      `StrongPass1${"x".repeat(80)}`,
    ),
  );
});
