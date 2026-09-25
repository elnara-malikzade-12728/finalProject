const test = require("node:test");
const assert = require("node:assert/strict");
const logger = require("../src/utils/logger");

test("warning logger is available for recoverable provider failures", () => {
  assert.equal(typeof logger.warn, "function");
});
