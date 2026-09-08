const test = require("node:test");
const assert = require("node:assert/strict");

const bunny = require("../src/lib/bunnyStream");

test("Bunny deletion can treat an already missing video as success", async (t) => {
  const originalFetch = global.fetch;
  const previous = {
    libraryId: process.env.BUNNY_STREAM_LIBRARY_ID,
    apiKey: process.env.BUNNY_STREAM_API_KEY,
    tokenKey: process.env.BUNNY_STREAM_TOKEN_KEY,
  };

  t.after(() => {
    global.fetch = originalFetch;
    for (const [key, value] of Object.entries({
      BUNNY_STREAM_LIBRARY_ID: previous.libraryId,
      BUNNY_STREAM_API_KEY: previous.apiKey,
      BUNNY_STREAM_TOKEN_KEY: previous.tokenKey,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  process.env.BUNNY_STREAM_LIBRARY_ID = "123";
  process.env.BUNNY_STREAM_API_KEY = "test-api-key";
  process.env.BUNNY_STREAM_TOKEN_KEY = "test-token-key";
  global.fetch = async () => ({ ok: false, status: 404, text: async () => "not found" });

  await assert.doesNotReject(() => bunny.deleteVideo("missing-video", { ignoreMissing: true }));
  await assert.rejects(() => bunny.deleteVideo("missing-video"), (error) => error.statusCode === 404);
});
