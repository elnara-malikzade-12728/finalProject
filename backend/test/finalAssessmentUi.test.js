const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("final assessment access errors remain visible after returning to the course", () => {
  const testPage = fs.readFileSync(
    path.join(__dirname, "../../career-platform/src/pages/TestPage.jsx"),
    "utf8",
  );
  const coursePage = fs.readFileSync(
    path.join(__dirname, "../../career-platform/src/pages/CourseDetailsPage.jsx"),
    "utf8",
  );

  assert.match(testPage, /state: \{ accessError: message \}/);
  assert.match(coursePage, /location\.state\?\.accessError/);
  assert.match(coursePage, /setNotification\(\{ type: "error", message: accessError \}\)/);
});
