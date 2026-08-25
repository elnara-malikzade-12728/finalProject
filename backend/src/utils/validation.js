const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PASSWORD_BYTES = 72;

function normalizeEmail(value) {
  return typeof value === "string"
    ? value.trim().toLowerCase()
    : "";
}

function isValidEmail(value) {
  return (
    value.length <= 254 &&
    EMAIL_PATTERN.test(value)
  );
}

function getPasswordValidationError(password) {
  if (typeof password !== "string") {
    return "Şifrə mətn formatında olmalıdır.";
  }

  if (password.length < 8) {
    return "Şifrə ən azı 8 simvoldan ibarət olmalıdır.";
  }

  if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
    return "Şifrə 72 baytdan uzun olmamalıdır.";
  }

  if (
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password)
  ) {
    return "Şifrə ən azı bir böyük hərf, bir kiçik hərf və bir rəqəm daxil etməlidir.";
  }

  return null;
}

module.exports = {
  getPasswordValidationError,
  isValidEmail,
  normalizeEmail,
};
