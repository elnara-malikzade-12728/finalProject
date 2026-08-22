require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerSpec = require("./src/config/swagger");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? allowedOrigins
    : true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
}));
app.use(express.json({ limit: "100kb" }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
}));

const apiRoutes = require("./src/routes");

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "KaryeraYol backend running",
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

        <title>KaryeraYol API Documentation</title>

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

app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(
      `Swagger documentation: http://localhost:${port}/api/docs`,
    );
  });
}

module.exports = app;