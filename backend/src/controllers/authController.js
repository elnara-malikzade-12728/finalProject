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

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      return res.status(409).json({
        error:
          "Bu e-poçt ünvanı artıq qeydiyyatdan keçib.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10,
    );

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return res
      .status(201)
      .json(createAuthenticationResponse(user));
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
};
