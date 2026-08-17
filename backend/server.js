require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerSpec = require("./src/config/swagger");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

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

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(
      `Swagger documentation: http://localhost:${port}/api/docs`,
    );
  });
}

module.exports = app;