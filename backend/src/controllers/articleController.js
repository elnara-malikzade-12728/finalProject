const prisma = require("../lib/prisma");
const logger = require("../utils/logger");

function parsePositiveInteger(value) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[əğıöşü]/g, (ch) =>
      ({ ə: "e", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" }[ch]),
    )
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateArticlePayload(body = {}, { partial = false } = {}) {
  const hasField = (field) =>
    Object.prototype.hasOwnProperty.call(body, field);
  const data = {};

  if (!partial || hasField("title")) {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return { error: "Məqalə başlığı daxil edilməlidir." };
    data.title = title;
  }

  if (hasField("summary")) {
    data.summary =
      typeof body.summary === "string" && body.summary.trim()
        ? body.summary.trim()
        : null;
  }

  if (!partial || hasField("content")) {
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content) return { error: "Məqalə mətni daxil edilməlidir." };
    data.content = content;
  }

  if (hasField("slug") && body.slug) {
    data.slug = slugify(body.slug);
  } else if (!partial && data.title) {
    data.slug = slugify(data.title);
  }

  if (data.slug !== undefined && !data.slug) {
    return { error: "Slug yaradıla bilmədi, başlığı yoxlayın." };
  }

  if (hasField("published")) {
    data.published = Boolean(body.published);
    data.publishedAt = data.published ? new Date() : null;
  }

  return { data };
}

async function listPublishedArticles(req, res) {
  try {
    const articles = await prisma.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        publishedAt: true,
      },
    });

    res.json(articles);
  } catch (err) {
    logger.error("Məqalə siyahısı alınarkən xəta", err);
    res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

async function getArticleBySlug(req, res) {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: req.params.slug },
    });

    if (!article || !article.published) {
      return res.status(404).json({ error: "Məqalə tapılmadı." });
    }

    res.json(article);
  } catch (err) {
    logger.error("Məqalə alınarkən xəta", err);
    res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

/**
 * Admin: bütün məqalələr (draft daxil).
 */
async function listAllArticles(req, res) {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { id: "desc" },
    });

    res.json(articles);
  } catch (err) {
    logger.error("Admin məqalə siyahısı alınarkən xəta", err);
    res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

async function createArticle(req, res) {
  try {
    const validation = validateArticlePayload(req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const article = await prisma.article.create({ data: validation.data });

    return res.status(201).json(article);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Bu slug artıq istifadə olunub." });
    }

    logger.error("Məqalə yaradılarkən xəta", err);
    return res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

async function updateArticle(req, res) {
  try {
    const id = parsePositiveInteger(req.params.id);
    if (!id) return res.status(404).json({ error: "Məqalə tapılmadı." });

    const validation = validateArticlePayload(req.body, { partial: true });
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Məqalə tapılmadı." });

    const article = await prisma.article.update({
      where: { id },
      data: validation.data,
    });

    return res.status(200).json(article);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Məqalə tapılmadı." });
    }
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Bu slug artıq istifadə olunub." });
    }

    logger.error("Məqalə yenilənərkən xəta", err);
    return res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

async function deleteArticle(req, res) {
  try {
    const id = parsePositiveInteger(req.params.id);
    if (!id) return res.status(404).json({ error: "Məqalə tapılmadı." });

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Məqalə tapılmadı." });

    await prisma.article.delete({ where: { id } });

    return res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Məqalə tapılmadı." });
    }

    logger.error("Məqalə silinərkən xəta", err);
    return res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

module.exports = {
  listPublishedArticles,
  getArticleBySlug,
  listAllArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  validateArticlePayload,
  slugify,
};