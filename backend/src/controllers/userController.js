const bcrypt = require("bcrypt");
const prisma = require("../lib/prisma");

const publicUserFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  education: true,
  location: true,
  bio: true,
  interests: true,
  skills: true,
};

function normalizeStringList(value) {
  if (!Array.isArray(value)) {
    return null;
  }

  return [
    ...new Set(
      value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

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
      education,
      location,
      bio,
      interests,
      skills,
    } = req.body;

    const updates = {};

    if (typeof name === "string" && name.trim()) {
      updates.name = name.trim();
    }

    for (const [field, value] of Object.entries({
      education,
      location,
      bio,
    })) {
      if (typeof value === "string") {
        updates[field] = value.trim() || null;
      }
    }

    if (interests !== undefined) {
      const normalizedInterests = normalizeStringList(interests);

      if (!normalizedInterests) {
        return res.status(400).json({
          error: "Maraq sahələri siyahı formatında olmalıdır.",
        });
      }

      updates.interests = normalizedInterests;
    }

    if (skills !== undefined) {
      const normalizedSkills = normalizeStringList(skills);

      if (!normalizedSkills) {
        return res.status(400).json({
          error: "Bacarıqlar siyahı formatında olmalıdır.",
        });
      }

      updates.skills = normalizedSkills;
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
