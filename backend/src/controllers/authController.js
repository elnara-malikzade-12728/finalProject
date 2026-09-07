require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const logger = require("../utils/logger");
const {
  getPasswordValidationError,
  isValidEmail,
  normalizeEmail,
} = require("../utils/validation");
const { createOneTimeToken, hashToken } = require("../services/authTokenService");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/emailService");

const GENERIC_REGISTRATION_MESSAGE = "Qeydiyyat məlumatları qəbul edildi. Hesab yaradıla bilərsə, təsdiq keçidi e-poçtunuza göndəriləcək.";
const GENERIC_RESET_MESSAGE = "Bu e-poçtla hesab mövcuddursa, şifrə yeniləmə keçidi göndəriləcək.";

const DUMMY_PASSWORD_HASH = bcrypt.hashSync(
  "DummyPassword1",
  10,
);

function createAuthenticationResponse(user) {
  const expiresIn = process.env.JWT_EXPIRES_IN || "1h";
  const token = jwt.sign(
    {
      userId: user.id,
      tokenVersion: user.tokenVersion,
    },
    process.env.JWT_SECRET,
    {
      expiresIn,
      algorithm: "HS256",
    },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isCorporate: user.isCorporate,
      emailVerifiedAt: user.emailVerifiedAt,
      education: user.education,
      location: user.location,
      bio: user.bio,
      interests: user.interests,
      skills: user.skills,
    },
  };
}

async function register(req, res) {
  try {
    const name = req.body.name?.trim();
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error:
          "Ad, e-poçt ünvanı və şifrə mütləq daxil edilməlidir.",
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        error: "Ad 100 simvoldan uzun olmamalıdır.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Düzgün e-poçt ünvanı daxil edin.",
      });
    }

    const passwordError =
      getPasswordValidationError(password);

    if (passwordError) {
      return res.status(400).json({
        error: passwordError,
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10,
    );

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      if (!existingUser.emailVerifiedAt) {
        const { token, hash } = createOneTimeToken();
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { verificationTokenHash: hash, verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
        });
        await sendVerificationEmail(existingUser, token);
      }
      return res.status(202).json({ message: GENERIC_REGISTRATION_MESSAGE });
    }

    const { token: verificationToken, hash: verificationTokenHash } = createOneTimeToken();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationTokenHash,
        verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendVerificationEmail(user, verificationToken);

    return res.status(202).json({ message: GENERIC_REGISTRATION_MESSAGE });
  } catch (error) {
    logger.error(
      "İstifadəçi qeydiyyatı zamanı xəta:",
      error,
    );

    return res.status(500).json({
      error:
        "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

async function login(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error:
          "E-poçt ünvanı və şifrə mütləq daxil edilməlidir.",
      });
    }

    if (
      !isValidEmail(email) ||
      typeof password !== "string" ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(401).json({
        error:
          "E-poçt ünvanı və ya şifrə yanlışdır.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    const passwordIsCorrect =
      await bcrypt.compare(
        password,
        user?.password || DUMMY_PASSWORD_HASH,
      );

    if (!user || !passwordIsCorrect || !user.isActive) {
      return res.status(401).json({
        error:
          "E-poçt ünvanı və ya şifrə yanlışdır.",
      });
    }

    if (!user.emailVerifiedAt) {
      return res.status(403).json({ error: "Daxil olmaq üçün əvvəlcə e-poçt ünvanınızı təsdiqləyin.", code: "EMAIL_NOT_VERIFIED" });
    }

    return res
      .status(200)
      .json(createAuthenticationResponse(user));
  } catch (error) {
    logger.error(
      "Sistemə giriş zamanı xəta:",
      error,
    );

    return res.status(500).json({
      error:
        "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

async function verifyEmail(req, res) {
  try {
    const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
    if (!token) return res.status(400).json({ error: "Təsdiq tokeni tələb olunur." });
    const user = await prisma.user.findFirst({
      where: { verificationTokenHash: hashToken(token), verificationTokenExpiresAt: { gt: new Date() } },
    });
    if (!user) return res.status(400).json({ error: "Təsdiq keçidi yanlışdır və ya vaxtı bitib." });
    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date(), verificationTokenHash: null, verificationTokenExpiresAt: null },
    });
    return res.json(createAuthenticationResponse(verifiedUser));
  } catch (error) {
    logger.error("E-poçt təsdiqi zamanı xəta", error);
    return res.status(500).json({ error: "E-poçt ünvanını təsdiqləmək mümkün olmadı." });
  }
}

async function resendVerification(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);
    if (isValidEmail(email)) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user && !user.emailVerifiedAt) {
        const { token, hash } = createOneTimeToken();
        await prisma.user.update({ where: { id: user.id }, data: { verificationTokenHash: hash, verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
        await sendVerificationEmail(user, token);
      }
    }
    return res.json({ message: GENERIC_REGISTRATION_MESSAGE });
  } catch (error) {
    logger.error("Təsdiq e-poçtu yenidən göndərilərkən xəta", error);
    return res.status(500).json({ error: "Sorğunu emal etmək mümkün olmadı." });
  }
}

async function forgotPassword(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);
    if (isValidEmail(email)) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user?.isActive) {
        const { token, hash } = createOneTimeToken();
        await prisma.user.update({ where: { id: user.id }, data: { passwordResetTokenHash: hash, passwordResetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
        await sendPasswordResetEmail(user, token);
      }
    }
    return res.json({ message: GENERIC_RESET_MESSAGE });
  } catch (error) {
    logger.error("Şifrə yeniləmə sorğusu zamanı xəta", error);
    return res.status(500).json({ error: "Sorğunu emal etmək mümkün olmadı." });
  }
}

async function resetPassword(req, res) {
  try {
    const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
    const passwordError = getPasswordValidationError(req.body?.password);
    if (!token) return res.status(400).json({ error: "Şifrə yeniləmə tokeni tələb olunur." });
    if (passwordError) return res.status(400).json({ error: passwordError });
    const user = await prisma.user.findFirst({
      where: { passwordResetTokenHash: hashToken(token), passwordResetTokenExpiresAt: { gt: new Date() } },
      select: { id: true },
    });
    if (!user) return res.status(400).json({ error: "Şifrə yeniləmə keçidi yanlışdır və ya vaxtı bitib." });
    const password = await bcrypt.hash(req.body.password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password, passwordResetTokenHash: null, passwordResetTokenExpiresAt: null, tokenVersion: { increment: 1 } },
    });
    return res.json({ message: "Şifrəniz uğurla yeniləndi. Yeni şifrə ilə daxil ola bilərsiniz." });
  } catch (error) {
    logger.error("Şifrə yenilənərkən xəta", error);
    return res.status(500).json({ error: "Şifrəni yeniləmək mümkün olmadı." });
  }
}

async function logout(req, res) {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        tokenVersion: { increment: 1 },
      },
    });

    return res.status(204).send();
  } catch (error) {
    logger.error("Sistemdən çıxış zamanı xəta", error);
    return res.status(500).json({
      error:
        "Sistemdən çıxışı tamamlamaq mümkün olmadı.",
    });
  }
}

module.exports = {
  register,
  login,
  logout,
  createAuthenticationResponse,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
};
