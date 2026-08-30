require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerSpec = require("./src/config/swagger");
const { apiLimiter } = require("./src/middleware/rateLimiters");
const logger = require("./src/utils/logger");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET mühit dəyişəni təyin edilməyib.");
}

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = new Set(
  [
    "http://localhost:5173",
    "https://karyerayol.vercel.app",
    ...(process.env.FRONTEND_URL || "").split(","),
  ]
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.set("trust proxy", 1);
app.use(
  helmet({
    // Swagger UI uses CDN assets and an inline initializer.
    contentSecurityPolicy: false,
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      const error = new Error("CORS origin is not allowed");
      error.status = 403;
      return callback(error);
    },
    credentials: true,
  }),
);
// Stripe webhook imzasını yoxlamaq üçün xam (raw) body lazımdır.
// Bu, express.json()-dan ƏVVƏL olmalıdır ki, həmin bir route üçün
// body JSON-a çevrilməsin.
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10kb" }));
app.use("/api", apiLimiter);

const apiRoutes = require("./src/routes");

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Synex Academy backend running",
    documentation: "/api/docs",
  });
});

app.get("/api/docs.json", (req, res) => {
  res.status(200).json(swaggerSpec);
});

app.get("/api/docs", (req, res) => {
  res.type("html").send(`
    <!DOCTYPE html>
    <html lang="az">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <title>Synex Academy API Documentation</title>

        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"
        />
      </head>

      <body>
        <div id="swagger-ui"></div>

        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>

        <script>
          window.onload = function () {
            SwaggerUIBundle({
              url: "/api/docs.json",
              dom_id: "#swagger-ui",
              deepLinking: true,
              displayRequestDuration: true,
              persistAuthorization: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              layout: "StandaloneLayout"
            });
          };
        </script>
      </body>
    </html>
  `);
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  logger.error("Emal edilməmiş server xətası", error);

  return res.status(error.status || 500).json({
    error:
      error.status === 403
        ? "Bu mənbədən API sorğusuna icazə verilmir."
        : "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(
      `Swagger documentation: http://localhost:${port}/api/docs`,
    );
  });
}

module.exports = app;