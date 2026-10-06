const { Prisma } = require("@prisma/client");
const prisma = require("../lib/prisma");

class PrismaRateLimitStore {
  constructor(prefix, db = prisma) {
    this.prefix = prefix;
    this.db = db;
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  async increment(key) {
    const bucketKey = `${this.prefix}:${key}`;
    const resetAt = new Date(Date.now() + this.windowMs);
    const rows = await this.db.$queryRaw(Prisma.sql`
      INSERT INTO "RateLimitBucket" ("key", "count", "resetAt", "updatedAt")
      VALUES (${bucketKey}, 1, ${resetAt}, NOW())
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimitBucket"."resetAt" <= NOW() THEN 1
          ELSE "RateLimitBucket"."count" + 1
        END,
        "resetAt" = CASE
          WHEN "RateLimitBucket"."resetAt" <= NOW() THEN EXCLUDED."resetAt"
          ELSE "RateLimitBucket"."resetAt"
        END,
        "updatedAt" = NOW()
      RETURNING "count", "resetAt"
    `);
    return { totalHits: rows[0].count, resetTime: rows[0].resetAt };
  }

  async decrement(key) {
    await this.db.rateLimitBucket.updateMany({
      where: { key: `${this.prefix}:${key}`, count: { gt: 0 } },
      data: { count: { decrement: 1 } },
    });
  }

  async resetKey(key) {
    await this.db.rateLimitBucket.deleteMany({ where: { key: `${this.prefix}:${key}` } });
  }

  async resetAll() {
    await this.db.rateLimitBucket.deleteMany({
      where: { key: { startsWith: `${this.prefix}:` } },
    });
  }
}

module.exports = { PrismaRateLimitStore };
