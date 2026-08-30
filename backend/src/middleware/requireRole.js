const requireAdmin = require("./requireAdmin");

module.exports = function requireRole(role) {
    return async function checkRole(req, res, next) {
        if (role === "ADMIN") {
            return requireAdmin(req, res, next);
        }

        if (!req.user || req.user.role !== role) {
            return res.status(403).json({
                error: `Bu əməliyyat yalnız ${role} roluna malik istifadəçilər üçün nəzərdə tutulub.`,
            });
        }

        return next();
    };
};
