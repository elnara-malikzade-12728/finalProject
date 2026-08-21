const bcrypt = require("bcrypt");
const prisma = require("../lib/prisma");

const publicUserFields = {
  id: true,
  name: true,
  email: true,
  role: true,
};

async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: publicUserFields,
    });

    if (!user) {
      return res.status(404).json({
        error: "İstifadəçi tapılmadı.",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(
      "Profil məlumatları alınarkən xəta:",
      error,
    );

    return res.status(500).json({
      error:
        "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

async function updateProfile(req, res) {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    const updates = {};

    if (typeof name === "string" && name.trim()) {
      updates.name = name.trim();
    }

    if (
      typeof email === "string" &&
      email.trim()
    ) {
      updates.email = email
        .trim()
        .toLowerCase();
    }

    if (
      typeof password === "string" &&
      password
    ) {
      if (password.length < 6) {
        return res.status(400).json({
          error:
            "Şifrə ən azı 6 simvoldan ibarət olmalıdır.",
        });
      }

      updates.password = await bcrypt.hash(
        password,
        10,
      );
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error:
          "Yenilənəcək profil məlumatı daxil edilməyib.",
      });
    }

    const user = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: updates,
      select: publicUserFields,
    });

    return res.status(200).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error:
          "Bu e-poçt ünvanı artıq istifadə olunur.",
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        error: "İstifadəçi tapılmadı.",
      });
    }

    console.error(
      "Profil yenilənərkən xəta:",
      error,
    );

    return res.status(500).json({
      error:
        "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
};