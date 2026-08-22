module.exports = function requireRole(role) {
    return function roleMiddleware(req, res, next) {
        if (!req.user) return res.status(401).json({ error: 'Authentication required' });
        if (req.user.role !== role) return res.status(403).json({ error: 'Insufficient permissions' });
        next();
    };
};