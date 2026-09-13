const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const courseDetailsSource = fs.readFileSync(
  path.join(__dirname, "../../career-platform/src/pages/CourseDetailsPage.jsx"),
  "utf8",
);

test("Bunny ended event is queued while a completion request is in flight", () => {
  assert.match(courseDetailsSource, /let pendingCompletionData = null/);
  assert.match(courseDetailsSource, /if \(completionRequested\) \{[\s\S]*pendingCompletionData = data/);
  assert.match(courseDetailsSource, /!completionConfirmed && pendingCompletionData/);
  assert.match(courseDetailsSource, /player\.getCurrentTime[\s\S]*player\.getDuration[\s\S]*handleEnded/);
});
