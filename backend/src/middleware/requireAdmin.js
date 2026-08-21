const prisma = require("../lib/prisma");

async function requireAdmin(req, res, next) {
  if (!req.user?.id) {
    return res.status(401).json({
      error:
        "Bu əməliyyat üçün sistemə daxil olmalısınız.",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "İstifadəçi tapılmadı.",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        error:
          "Bu əməliyyat yalnız administratorlar üçün nəzərdə tutulub.",
      });
    }

    req.user.role = user.role;

    return next();
  } catch (error) {
    console.error(
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