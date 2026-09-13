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

test("leaving a Bunny lesson cannot fail while detaching player events", () => {
  assert.match(courseDetailsSource, /const safelyDetachPlayerEvent =/);
  assert.match(courseDetailsSource, /if \(player\.elem\?\.contentWindow\) player\.off/);
  assert.match(courseDetailsSource, /catch \{[\s\S]*late player callbacks harmless/);
  assert.match(courseDetailsSource, /safelyDetachPlayerEvent\("ended", handleEnded\)/);
});

test("frontend and server use the same bounded Bunny end tolerance", () => {
  assert.match(courseDetailsSource, /function getPlaybackEndTolerance/);
  assert.match(courseDetailsSource, /Math\.max\(1, Math\.min\(15, Math\.ceil\(duration \* 0\.02\)\)\)/);
  assert.match(courseDetailsSource, /duration - seconds <= getPlaybackEndTolerance\(duration\)/);
});

test("Bunny completion sampler falls back to stored video duration", () => {
  assert.match(courseDetailsSource, /const eventDuration = Number\(data\.duration\) \|\| 0/);
  assert.match(courseDetailsSource, /eventDuration[\s\S]*playerDurationSeconds[\s\S]*Number\(video\.durationSeconds\)[\s\S]*Number\(selectedLesson\.durationSeconds\)/);
  assert.match(courseDetailsSource, /handleEnded\(\{ seconds, duration \}\)/);
});

test("expired authentication stops completion retries and returns to login", () => {
  assert.match(courseDetailsSource, /requestError instanceof ApiError && requestError\.status === 401/);
  assert.match(courseDetailsSource, /completionConfirmed = true;[\s\S]*isPlaying = false;[\s\S]*await refreshUser\(\)/);
  assert.match(courseDetailsSource, /navigate\("\/login", \{[\s\S]*replace: true/);
});
