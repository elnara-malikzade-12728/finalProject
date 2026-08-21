const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "KaryeraYol API",
      version: "1.0.0",
      description:
        "KaryeraYol authentication, careers, jobs, user profiles, progress and secure lesson video API.",
    },

    servers: [
      {
        url: "https://karyerayol-api.vercel.app",
        description: "Production server",
      },
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
      {
        name: "Videos",
        description:
          "Private lesson video upload, playback and deletion",
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
              example: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
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
            role: {
              type: "string",
              enum: ["USER", "ADMIN"],
              example: "USER",
            },
          },
        },

        LessonVideo: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            title: {
              type: "string",
              example: "HTML ilə ilk addım",
            },
            videoPath: {
              type: "string",
              nullable: true,
              example:
                "courses/1/modules/1/lessons/1/550e8400-e29b-41d4-a716-446655440000.mp4",
            },
            videoMimeType: {
              type: "string",
              nullable: true,
              example: "video/mp4",
            },
            videoSizeBytes: {
              type: "integer",
              nullable: true,
              example: 4938271,
            },
            durationSeconds: {
              type: "integer",
              nullable: true,
              example: 185,
            },
          },
        },

        VideoUploadCredentials: {
          type: "object",
          properties: {
            bucket: {
              type: "string",
              example: "course-videos",
            },
            path: {
              type: "string",
              example:
                "courses/1/modules/1/lessons/1/550e8400-e29b-41d4-a716-446655440000.mp4",
            },
            token: {
              type: "string",
              description: "Short-lived Supabase signed-upload token",
            },
            signedUrl: {
              type: "string",
              format: "uri",
            },
            expiresIn: {
              type: "integer",
              example: 7200,
            },
            contentType: {
              type: "string",
              example: "video/mp4",
            },
            sizeBytes: {
              type: "integer",
              example: 4938271,
            },
          },
        },

        VideoAccess: {
          type: "object",
          properties: {
            url: {
              type: "string",
              format: "uri",
              description: "Temporary signed playback URL",
            },
            expiresIn: {
              type: "integer",
              example: 600,
            },
            lessonId: {
              type: "integer",
              example: 1,
            },
            title: {
              type: "string",
              example: "HTML ilə ilk addım",
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
