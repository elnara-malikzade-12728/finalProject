const test = require("node:test");
const assert = require("node:assert/strict");

const {
  validateInquiryPayload,
} = require("../src/controllers/corporateInquiryController");

const validPayload = {
  companyName: "Synex MMC",
  contactName: "Aynur Məmmədova",
  email: "aynur@synex.az",
  phone: "+994501234567",
  employeeCount: 42,
  message: "Komandamız üçün toplu təlim istəyirik.",
};

test("corporate inquiry accepts a fully valid submission", () => {
  const result = validateInquiryPayload(validPayload);

  assert.equal(result.error, undefined);
  assert.equal(result.data.companyName, "Synex MMC");
  assert.equal(result.data.employeeCount, 42);
});

test("corporate inquiry rejects a missing company name", () => {
  const { companyName, ...rest } = validPayload;
  const result = validateInquiryPayload(rest);

  assert.ok(result.error);
});

test("corporate inquiry rejects a missing contact name", () => {
  const { contactName, ...rest } = validPayload;
  const result = validateInquiryPayload(rest);

  assert.ok(result.error);
});

test("corporate inquiry rejects a malformed email", () => {
  const result = validateInquiryPayload({
    ...validPayload,
    email: "not-an-email",
  });

  assert.ok(result.error);
});

test("corporate inquiry rejects a missing message", () => {
  const { message, ...rest } = validPayload;
  const result = validateInquiryPayload(rest);

  assert.ok(result.error);
});

test("corporate inquiry rejects a non-positive employee count", () => {
  const result = validateInquiryPayload({
    ...validPayload,
    employeeCount: 0,
  });

  assert.ok(result.error);
});

test("corporate inquiry allows omitting the optional phone number", () => {
  const { phone, ...rest } = validPayload;
  const result = validateInquiryPayload(rest);

  assert.equal(result.error, undefined);
  assert.equal(result.data.phone, undefined);
});