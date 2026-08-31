const test = require("node:test");
const assert = require("node:assert/strict");

const {
  validateArticlePayload,
  slugify,
} = require("../src/controllers/articleController");

test("slugify converts Azerbaijani characters and spaces", () => {
  assert.equal(
    slugify("Kariyeranı İnkişaf Etdirmək Üçün Məsləhətlər"),
    "kariyerani-inkisaf-etdirmek-ucun-meslehetler",
  );
});

test("slugify trims stray dashes", () => {
  assert.equal(slugify("  --Hello World!--  "), "hello-world");
});

test("article payload accepts a valid published article", () => {
  const result = validateArticlePayload({
    title: "Yeni kurslar",
    content: "Bu məqalə yeni kurslar haqqındadır.",
    published: true,
  });

  assert.equal(result.error, undefined);
  assert.equal(result.data.title, "Yeni kurslar");
  assert.equal(result.data.slug, "yeni-kurslar");
  assert.equal(result.data.published, true);
  assert.ok(result.data.publishedAt instanceof Date);
});

test("article payload rejects a missing title", () => {
  const result = validateArticlePayload({
    content: "Mətn var, başlıq yoxdur.",
  });

  assert.ok(result.error);
});

test("article payload rejects a missing content", () => {
  const result = validateArticlePayload({
    title: "Başlıq var, mətn yoxdur",
  });

  assert.ok(result.error);
});

test("article payload sets publishedAt to null when unpublished", () => {
  const result = validateArticlePayload({
    title: "Qaralama",
    content: "Hələ dərc edilməyib.",
    published: false,
  });

  assert.equal(result.error, undefined);
  assert.equal(result.data.published, false);
  assert.equal(result.data.publishedAt, null);
});

test("partial article payload (update) allows omitting title/content", () => {
  const result = validateArticlePayload(
    { published: true },
    { partial: true },
  );

  assert.equal(result.error, undefined);
  assert.equal(result.data.title, undefined);
  assert.equal(result.data.published, true);
});

test("article payload uses a custom slug when supplied", () => {
  const result = validateArticlePayload({
    title: "Rəsmi elan",
    content: "Mətn.",
    slug: "Custom Slug!!",
  });

  assert.equal(result.error, undefined);
  assert.equal(result.data.slug, "custom-slug");
});