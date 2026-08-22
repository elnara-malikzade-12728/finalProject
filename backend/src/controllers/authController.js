require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

function createAuthenticationResponse(user) {
  const token = jwt.sign(
    {
      userId: user.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

async function register(req, res) {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email
      ?.trim()
      .toLowerCase();
    const { password } = req.body;

    if (!name || !email || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        error:
          "Ad, düzgün e-poçt ünvanı və ən azı 8 simvolluq şifrə mütləq daxil edilməlidir.",
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
    console.error(
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
    const email = req.body.email
      ?.trim()
      .toLowerCase();
    const { password } = req.body;

    if (!email || typeof password !== "string" || !password) {
      return res.status(400).json({
        error:
          "E-poçt ünvanı və şifrə mütləq daxil edilməlidir.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        error:
          "E-poçt ünvanı və ya şifrə yanlışdır.",
      });
    }

    const passwordIsCorrect =
      await bcrypt.compare(password, user.password);

    if (!passwordIsCorrect) {
      return res.status(401).json({
        error:
          "E-poçt ünvanı və ya şifrə yanlışdır.",
      });
    }

    return res
      .status(200)
      .json(createAuthenticationResponse(user));
  } catch (error) {
    console.error(
      "Sistemə giriş zamanı xəta:",
      error,
    );

    return res.status(500).json({
      error:
        "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

module.exports = {
  register,
  login,
};