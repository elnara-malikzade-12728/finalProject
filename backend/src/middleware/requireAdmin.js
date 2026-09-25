const logger = require("../utils/logger");

async function requireAdmin(req, res, next) {
  if (!req.user?.id) {
    return res.status(401).json({
      error:
        "Bu əməliyyat üçün sistemə daxil olmalısınız.",
    });
  }

  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        error:
          "Bu əməliyyat yalnız administratorlar üçün nəzərdə tutulub.",
      });
    }

    return next();
  } catch (error) {
    logger.error(
      "Administrator icazəsi yoxlanılarkən xəta:",
      error,
    );

    return res.status(500).json({
      error:
        "İstifadəçi icazəsini yoxlamaq mümkün olmadı.",
    });
  }
}

module.exports = requireAdmin;
