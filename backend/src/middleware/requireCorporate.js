module.exports = function requireCorporate(req, res, next) {
  if (!req.user?.isCorporate && req.user?.role !== "ADMIN") {
    return res.status(403).json({
      error: "Şirkət paneli yalnız administrator tərəfindən təsdiqlənmiş korporativ hesablar üçündür.",
    });
  }

  return next();
};
