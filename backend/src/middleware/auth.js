require("dotenv").config();

const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const logger = require("../utils/logger");

module.exports = async function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "Autentifikasiya tokeni təqdim edilməyib.",
    });
  }

  const parts = authHeader.trim().split(/\s+/);

  if (
    parts.length !== 2 ||
    !/^Bearer$/i.test(parts[0]) ||
    !parts[1]
  ) {
    return res.status(401).json({
      error: "Autentifikasiya tokeninin formatı yanlışdır.",
    });
  }

  let payload;
  try {
    payload = jwt.verify(
      parts[1],
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] },
    );
  } catch (error) {
    return res.status(401).json({
      error: "Autentifikasiya tokeni yanlışdır və ya vaxtı bitib.",
      code: error?.name === "TokenExpiredError" ? "AUTH_TOKEN_EXPIRED" : "AUTH_TOKEN_INVALID",
    });
  }

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        role: true,
        isCorporate: true,
        isActive: true,
        tokenVersion: true,
      },
    });
  } catch (error) {
    // A production database timeout is not an authentication failure. Returning
    // 401 here makes the SPA delete a valid JWT and unexpectedly logs users out.
    logger.error("Autentifikasiya üçün istifadəçi məlumatı alınarkən xəta", error);
    return res.status(503).json({
      error: "Autentifikasiya xidməti müvəqqəti olaraq əlçatan deyil. Zəhmət olmasa, yenidən cəhd edin.",
      code: "AUTH_SERVICE_UNAVAILABLE",
    });
  }

  if (
    !user ||
    !user.isActive ||
    payload.tokenVersion !== user.tokenVersion
  ) {
    return res.status(401).json({
      error: "İstifadəçi hesabı mövcud deyil, deaktiv edilib və ya sessiya ləğv olunub.",
      code: "AUTH_SESSION_REVOKED",
    });
  }

  req.user = user;
  return next();
};
