const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeVideoDuration, validateBunnyUploadBinding } = require("../src/controllers/videoController");

const now = new Date("2026-08-31T12:00:00.000Z");

test("accepts the Bunny video issued for the lesson", () => {
  const lesson = {
    pendingVideoProviderId: "video-for-lesson",
    pendingVideoExpiresAt: new Date("2026-08-31T13:00:00.000Z"),
  };
  assert.equal(validateBunnyUploadBinding(lesson, "video-for-lesson", now), null);
});

test("rejects a Bunny video issued for another lesson", () => {
  const lesson = {
    pendingVideoProviderId: "expected-video",
    pendingVideoExpiresAt: new Date("2026-08-31T13:00:00.000Z"),
  };
  assert.deepEqual(validateBunnyUploadBinding(lesson, "different-video", now), {
    status: 400,
    error: "Bu Bunny videosu həmin dərs üçün yaradılmayıb.",
  });
});

test("rejects an expired Bunny upload session", () => {
  const lesson = {
    pendingVideoProviderId: "expected-video",
    pendingVideoExpiresAt: new Date("2026-08-31T11:59:59.000Z"),
  };
  assert.deepEqual(validateBunnyUploadBinding(lesson, "expected-video", now), {
    status: 410,
    error: "Video yükləmə sessiyasının vaxtı bitib. Yeni yükləmə keçidi yaradın.",
  });
});

test("normalizes Bunny's decimal duration for Prisma integer storage", () => {
  assert.equal(normalizeVideoDuration(14.47), 14);
  assert.equal(normalizeVideoDuration(0, 887.4), 887);
  assert.equal(normalizeVideoDuration(undefined, null), null);
});
