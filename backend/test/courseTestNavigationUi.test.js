const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const navbarSource = fs.readFileSync(
  path.join(__dirname, "../../career-platform/src/components/layout/Navbar.jsx"),
  "utf8",
);
const appSource = fs.readFileSync(
  path.join(__dirname, "../../career-platform/src/App.jsx"),
  "utf8",
);
const courseSource = fs.readFileSync(
  path.join(__dirname, "../../career-platform/src/pages/CourseDetailsPage.jsx"),
  "utf8",
);

test("the learner navbar does not expose a standalone test catalogue", () => {
  assert.doesNotMatch(navbarSource, /to="\/tests"/);
  assert.doesNotMatch(navbarSource, />\s*Testlər\s*</);
});

test("the old test catalogue route redirects to courses", () => {
  assert.match(appSource, /path="tests"[\s\S]*element=\{<Navigate to="\/courses" replace \/>\}/);
  assert.doesNotMatch(appSource, /import\("\.\/pages\/TestsPage\.jsx"\)/);
});

test("individual tests remain reachable from their course lessons", () => {
  assert.match(courseSource, /to=\{`\/tests\/\$\{selectedLessonTest\.id\}`\}/);
  assert.match(appSource, /path="tests\/:testId"[\s\S]*element=\{<TestPage \/>\}/);
});

test("the final exam appears inside the course and is prerequisite-gated", () => {
  assert.match(courseSource, /aria-label="Yekun imtahan"/);
  assert.match(courseSource, /allLessonsCompleted[\s\S]*allLessonTestsPassed/);
  assert.match(courseSource, /to=\{`\/tests\/\$\{finalTest\.id\}`\}/);
});
