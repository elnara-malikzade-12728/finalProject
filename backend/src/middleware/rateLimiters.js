const { rateLimit } = require("express-rate-limit");

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
  limit: 100,
});

const loginLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
});

const registerLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000,
  limit: 10,
});

module.exports = {
  apiLimiter,
  loginLimiter,
  registerLimiter,
};
