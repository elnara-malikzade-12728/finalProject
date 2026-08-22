require('dotenv').config();
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

module.exports = async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No authorization header' });

  const parts = authHeader.trim().split(/\s+/);
  if (parts.length !== 2) return res.status(401).json({ error: 'Invalid authorization header format' });

  const scheme = parts[0];
  const token = parts[1];

  if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ error: 'Malformed authorization header' });

  try {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (!Number.isInteger(payload.userId)) return res.status(401).json({ error: 'Invalid token' });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true }
    });
    if (!user) return res.status(401).json({ error: 'User no longer exists' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
