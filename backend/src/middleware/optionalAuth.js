require("dotenv").config();
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

function createOptionalAuth(jwtClient = jwt, prismaClient = prisma) {
  return async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();
  const parts = authHeader.trim().split(/\s+/);
  if (parts.length !== 2 || !/^Bearer$/i.test(parts[0]) || !parts[1]) return next();
  try {
    const payload = jwtClient.verify(parts[1], process.env.JWT_SECRET, { algorithms: ["HS256"] });
    const user = await prismaClient.user.findUnique({ where: { id: payload.userId }, select: { id: true, role: true, isActive: true, tokenVersion: true } });
    if (!user || !user.isActive || payload.tokenVersion !== user.tokenVersion) return next();
    req.user = user;
    return next();
  } catch (_error) {
    return next();
  }
  };
}

module.exports = createOptionalAuth();
module.exports.createOptionalAuth = createOptionalAuth;
