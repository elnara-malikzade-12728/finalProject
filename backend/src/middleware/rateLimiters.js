const { ipKeyGenerator, rateLimit } = require("express-rate-limit");
const { PrismaRateLimitStore } = require("./prismaRateLimitStore");

function firstHeaderValue(value) {
  return String(value || "").split(",")[0].trim();
}

function getTrustedClientIp(req) {
  if (process.env.VERCEL === "1") {
    return firstHeaderValue(req.get("x-vercel-forwarded-for")) || req.ip;
  }

  return req.ip;
}

function ipLimitKey(req) {
  return ipKeyGenerator(getTrustedClientIp(req) || req.socket?.remoteAddress || "unknown");
}

function accountLimitKey(req) {
  const email = String(req.body?.email || "").trim().toLowerCase();
  return email ? `account:${email}` : `ip:${ipLimitKey(req)}`;
}

const commonOptions = {
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error:
      "Həddindən artıq sorğu göndərildi. Zəhmət olmasa, bir qədər sonra yenidən cəhd edin.",
  },
};

function distributedStore(prefix) {
  if (process.env.VERCEL !== "1" && process.env.RATE_LIMIT_STORE !== "prisma") return undefined;
  return new PrismaRateLimitStore(prefix);
}

const apiLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 300,
  skip: (req) => req.method === "OPTIONS",
  keyGenerator: ipLimitKey,
  store: distributedStore("api"),
});

const loginLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: accountLimitKey,
  store: distributedStore("login"),
});

const registerLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  keyGenerator: ipLimitKey,
  store: distributedStore("register"),
});

const corporateInquiryLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: ipLimitKey,
  store: distributedStore("corporate-inquiry"),
});

const accountRecoveryLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: accountLimitKey,
  store: distributedStore("account-recovery"),
});

const accountDeletionLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `account-delete:${req.user.id}`,
  store: distributedStore("account-deletion"),
});

module.exports = {
  getTrustedClientIp,
  ipLimitKey,
  accountLimitKey,
  apiLimiter,
  loginLimiter,
  registerLimiter,
  corporateInquiryLimiter,
  accountRecoveryLimiter,
  accountDeletionLimiter,
  distributedStore,
};
