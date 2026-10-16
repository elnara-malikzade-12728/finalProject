const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const navbarSource = fs.readFileSync(
  path.join(__dirname, "../../career-platform/src/components/layout/Navbar.jsx"),
  "utf8",
);

test("Daha çox closes on outside pointer interaction", () => {
  assert.match(navbarSource, /document\.addEventListener\("pointerdown", handleOutsidePointer\)/);
  assert.match(navbarSource, /!moreMenuRef\.current\.contains\(event\.target\)/);
  assert.match(navbarSource, /moreMenuRef\.current\.open = false/);
});

test("Daha çox closes with Escape and restores summary focus", () => {
  assert.match(navbarSource, /event\.key === "Escape"/);
  assert.match(navbarSource, /querySelector\("summary"\)\?\.focus\(\)/);
});

test("Daha çox closes after navigation", () => {
  assert.match(navbarSource, /\}, \[location\.pathname\]\)/);
});
