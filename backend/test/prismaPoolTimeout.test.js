const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const prismaSource = fs.readFileSync(path.join(__dirname, "../src/lib/prisma.js"), "utf8");

test("an exhausted Prisma pool does not perform a second blocking retry", () => {
  assert.match(prismaSource, /error\?\.code === "P2024"/);
  assert.match(prismaSource, /without a second blocking retry/);
  assert.doesNotMatch(prismaSource, /retrying once on the existing pool/);
});
