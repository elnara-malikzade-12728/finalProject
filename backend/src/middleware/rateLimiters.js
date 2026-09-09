const { ipKeyGenerator, rateLimit } = require("express-rate-limit");

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

const apiLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 300,
  skip: (req) => req.method === "OPTIONS",
  keyGenerator: ipLimitKey,
});

const loginLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: accountLimitKey,
});

const registerLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  keyGenerator: ipLimitKey,
});

const corporateInquiryLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: ipLimitKey,
});

const accountRecoveryLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: accountLimitKey,
});

const accountDeletionLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `account-delete:${req.user.id}`,
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
};
