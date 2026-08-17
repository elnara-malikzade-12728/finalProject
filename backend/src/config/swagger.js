const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "KaryeraYol API",
      version: "1.0.0",
      description:
        "KaryeraYol authentication, careers, jobs, user profiles and progress API.",
    },

    servers: [
      {
        url: "http://localhost:4000",
        description: "Local development server",
      },
    ],

    tags: [
      {
        name: "Authentication",
        description: "Registration and login",
      },
      {
        name: "Users",
        description: "User profile operations",
      },
      {
        name: "Careers",
        description: "Career and roadmap operations",
      },
      {
        name: "Jobs",
        description: "Job and internship operations",
      },
      {
        name: "Progress",
        description: "User roadmap progress",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Server error",
            },
          },
        },

        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "Demo User",
            },
            email: {
              type: "string",
              format: "email",
              example: "demo@example.com",
            },
          },
        },

        Career: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            title: {
              type: "string",
              example: "Frontend Developer",
            },
            description: {
              type: "string",
              nullable: true,
            },
          },
        },

        Job: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            title: {
              type: "string",
              example: "Junior Frontend Developer",
            },
            company: {
              type: "string",
              nullable: true,
            },
            location: {
              type: "string",
              nullable: true,
            },
            description: {
              type: "string",
              nullable: true,
            },
            url: {
              type: "string",
              format: "uri",
              nullable: true,
            },
            careerId: {
              type: "integer",
              example: 1,
            },
          },
        },
      },
    },
  },

  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);