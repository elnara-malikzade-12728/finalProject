require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
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
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: "KaryeraYol API Documentation",
  }),
);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(
      `Swagger documentation: http://localhost:${port}/api/docs`,
    );
  });
}

module.exports = app;