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

  try {
    const payload = jwt.verify(
      parts[1],
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] },
    );

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        role: true,
        isActive: true,
        tokenVersion: true,
      },
    });

    if (
      !user ||
      !user.isActive ||
      payload.tokenVersion !== user.tokenVersion
    ) {
      return res.status(401).json({
        error: "İstifadəçi hesabı mövcud deyil və ya deaktiv edilib.",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (
      error?.name !== "JsonWebTokenError" &&
      error?.name !== "TokenExpiredError"
    ) {
      logger.error("Autentifikasiya zamanı xəta", error);
    }

    return res.status(401).json({
      error: "Autentifikasiya tokeni yanlışdır və ya vaxtı bitib.",
    });
  }
};
