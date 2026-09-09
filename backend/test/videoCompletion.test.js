const test = require("node:test");
const assert = require("node:assert/strict");

const { isPlaybackComplete } = require("../src/controllers/courseController");

test("video completion tolerates a small provider duration mismatch", () => {
  assert.equal(isPlaybackComplete(885, 900), true);
  assert.equal(isPlaybackComplete(884, 900), false);
});

test("short videos still require playback to reach their final second", () => {
  assert.equal(isPlaybackComplete(14, 16), false);
  assert.equal(isPlaybackComplete(15, 16), true);
});

test("invalid playback durations never complete a lesson", () => {
  assert.equal(isPlaybackComplete(100, 0), false);
  assert.equal(isPlaybackComplete(Number.NaN, 100), false);
});
