const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "../src/services/courseAccessService.js"), "utf8");

test("course access checks certificates by both user and course", () => {
  assert.match(source, /certificate\.findFirst\(\{[\s\S]*where:\s*\{\s*userId,\s*courseId\s*\}/);
  assert.match(source, /if \(await hasCourseCertificate\(userId, courseId\)\) return true/);
});

test("certificate access keeps the existing paid entitlement checks", () => {
  assert.match(source, /hasActiveSubscription\(userId\)/);
  assert.match(source, /hasValidCoursePurchase\(userId, courseId\)/);
});
