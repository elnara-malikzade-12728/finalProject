const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

function frontendUrl(path, token) {
  const base = (process.env.FRONTEND_URL || "http://localhost:5173").split(",")[0].replace(/\/$/, "");
  return `${base}${path}?token=${encodeURIComponent(token)}`;
}

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    disableFileAccess: true,
    disableUrlAccess: true,
  });
}

async function deliver({ to, subject, text }) {
  const transport = getTransport();
  if (!transport) {
    if (process.env.NODE_ENV === "production") throw new Error("SMTP configuration is missing");
    logger.info(`[TEST EMAIL] to=${to} subject=${subject} ${text}`);
    return;
  }
  await transport.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
}

async function sendVerificationEmail(user, token) {
  const url = frontendUrl("/verify-email", token);
  await deliver({
    to: user.email,
    subject: "Synex Academy e-poçt təsdiqi",
    text: `Salam ${user.name}. E-poçt ünvanınızı təsdiqləmək üçün bu keçiddən istifadə edin: ${url}\n\nKeçid 24 saat ərzində etibarlıdır.`,
  });
}

async function sendPasswordResetEmail(user, token) {
  const url = frontendUrl("/reset-password", token);
  await deliver({
    to: user.email,
    subject: "Synex Academy şifrə yeniləmə",
    text: `Salam ${user.name}. Şifrənizi yeniləmək üçün bu keçiddən istifadə edin: ${url}\n\nKeçid 1 saat ərzində etibarlıdır. Əgər bunu siz istəməmisinizsə, mesajı nəzərə almayın.`,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail, frontendUrl };
