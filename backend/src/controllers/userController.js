const bcrypt = require("bcrypt");
const prisma = require("../lib/prisma");
const logger = require("../utils/logger");
const { getSupabaseAdmin } = require("../lib/supabase");
const {
  getPasswordValidationError,
  isValidEmail,
  normalizeEmail,
} = require("../utils/validation");

const ACCOUNT_DELETION_PHRASE = "HESABIMI SIL";

function hasValidAccountDeletionConfirmation(value) {
  return typeof value === "string" && value.trim() === ACCOUNT_DELETION_PHRASE;
}

const publicUserFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  isCorporate: true,
  emailVerifiedAt: true,
  education: true,
  location: true,
  bio: true,
  interests: true,
  skills: true,
  careerAutoApplyEnabled: true,
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
    logger.error(
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
      currentPassword,
      education,
      location,
      bio,
      interests,
      skills,
      careerAutoApplyEnabled,
    } = req.body;

    const updates = {};

    if (typeof name === "string" && name.trim()) {
      if (name.trim().length > 100) {
        return res.status(400).json({
          error: "Ad 100 simvoldan uzun olmamalıdır.",
        });
      }

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

    if (careerAutoApplyEnabled !== undefined) {
      if (typeof careerAutoApplyEnabled !== "boolean") {
        return res.status(400).json({ error: "Avtomatik CV yönləndirmə seçimi boolean olmalıdır." });
      }
      updates.careerAutoApplyEnabled = careerAutoApplyEnabled;
    }

    if (
      typeof email === "string" &&
      email.trim()
    ) {
      const normalizedEmail = normalizeEmail(email);

      if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({
          error: "Düzgün e-poçt ünvanı daxil edin.",
        });
      }

      updates.email = normalizedEmail;
    }

    if (
      typeof password === "string" &&
      password
    ) {
      const passwordError =
        getPasswordValidationError(password);

      if (passwordError) {
        return res.status(400).json({
          error: passwordError,
        });
      }

      if (
        typeof currentPassword !== "string" ||
        !currentPassword
      ) {
        return res.status(400).json({
          error:
            "Şifrəni dəyişmək üçün cari şifrəni daxil edin.",
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { password: true },
      });

      if (
        !existingUser ||
        !(await bcrypt.compare(
          currentPassword,
          existingUser.password,
        ))
      ) {
        return res.status(401).json({
          error: "Cari şifrə yanlışdır.",
        });
      }

      updates.password = await bcrypt.hash(
        password,
        10,
      );
      updates.tokenVersion = { increment: 1 };
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

    logger.error(
      "Profil yenilənərkən xəta:",
      error,
    );

    return res.status(500).json({
      error:
        "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

async function deleteMyAccount(req, res) {
  try {
    if (req.user.role === "ADMIN") {
      return res.status(403).json({ error: "Administrator hesabı bu bölmədən silinə bilməz." });
    }
    const currentPassword = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
    if (!currentPassword) {
      return res.status(400).json({ error: "Hesabı silmək üçün cari şifrəni daxil edin." });
    }
    if (!hasValidAccountDeletionConfirmation(req.body?.confirmation)) {
      return res.status(400).json({ error: `Təsdiq sahəsinə dəqiq olaraq ${ACCOUNT_DELETION_PHRASE} yazın.` });
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, password: true, cvFilePath: true } });
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ error: "Cari şifrə yanlışdır." });
    }
    await prisma.user.delete({ where: { id: user.id } });
    if (user.cvFilePath) {
      try {
        const bucket = process.env.SUPABASE_CV_BUCKET || "user-cvs";
        const { error: storageError } = await getSupabaseAdmin().storage.from(bucket).remove([user.cvFilePath]);
        if (storageError) logger.warn("Silinmiş hesaba aid CV Storage-dan silinmədi", storageError);
      } catch (storageError) {
        logger.warn("Silinmiş hesaba aid CV Storage təmizlənərkən xəta", storageError);
      }
    }
    return res.status(204).end();
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ error: "İstifadəçi tapılmadı." });
    logger.error("Hesab silinərkən xəta:", error);
    return res.status(500).json({ error: "Hesabı silmək mümkün olmadı." });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  deleteMyAccount,
  hasValidAccountDeletionConfirmation,
  ACCOUNT_DELETION_PHRASE,
};
