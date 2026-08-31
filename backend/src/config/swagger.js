const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "Synex Academy API",
      version: "1.1.0",
      description:
        "Synex Academy API for authentication, learning, assessments, certificates, jobs, profiles, secure video, payments, subscriptions, articles and corporate inquiries.",
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
        name: "Plans",
        description: "Abunəlik planlarının idarə edilməsi",
      },
      {
        name: "Articles",
        description: "Bloq məqalələrinin idarə edilməsi",
      },
      {
        name: "Payments",
        description: "Ödəniş və checkout əməliyyatları",
      },
      {
        name: "Subscriptions",
        description: "İstifadəçi abunəliklərinin idarə edilməsi",
      },
            {
        name: "Corporate",
        description: "Korporativ B2B müraciətlərinin idarə edilməsi",
      },
      {
        name: "Applications",
        description: "User job applications and administrator application management",
      },
      {
        name: "Progress",
        description: "User roadmap progress",
      },
      {
        name: "Videos",
        description:
          "Şəxsi dərs videolarının yüklənməsi, izlənməsi və silinməsi",
      },
      {
        name: "Course Management",
        description: "Administrator course, category, module and lesson management",
      },
      {
        name: "Tests",
        description: "Assessment test and question administration",
      },
      {
        name: "Questions",
        description: "Assessment question management",
      },
      {
        name: "Attempts",
        description: "User assessment attempt workflow",
      },
      {
        name: "Certificates",
        description: "Assessment certificate issuance and verification",
      },
      {
        name: "CV Management",
        description: "User CV upload, storage and lifecycle management",
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
        CourseCategory: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Cybersecurity" },
            description: { type: "string", nullable: true },
            order: { type: "integer", example: 1 },
          },
        },
        CourseLesson: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "Introduction to OWASP Top 10" },
            description: { type: "string", nullable: true },
            order: { type: "integer", example: 1 },
            published: { type: "boolean", example: true },
            moduleId: { type: "integer", example: 1 },
          },
        },
        CourseModule: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "Web Security" },
            description: { type: "string", nullable: true },
            order: { type: "integer", example: 3 },
            courseId: { type: "integer", example: 1 },
            lessons: { type: "array", items: { $ref: "#/components/schemas/CourseLesson" } },
          },
        },
        ManagedCourse: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "Introduction to Ethical Hacking" },
            description: { type: "string", nullable: true },
            published: { type: "boolean", example: true },
            categoryId: { type: "integer", nullable: true, example: 1 },
            category: { $ref: "#/components/schemas/CourseCategory" },
            modules: { type: "array", items: { $ref: "#/components/schemas/CourseModule" } },
          },
        },
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
            education: {
              type: "string",
              nullable: true,
              example: "Bakı Dövlət Universiteti",
            },
            location: {
              type: "string",
              nullable: true,
              example: "Bakı",
            },
            bio: {
              type: "string",
              nullable: true,
              example: "Frontend proqramlaşdırma ilə maraqlanıram.",
            },
            interests: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["Frontend", "UI/UX"],
            },
            skills: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["HTML", "CSS", "JavaScript"],
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
            videoProvider: {
              type: "string",
              nullable: true,
              enum: ["SUPABASE", "BUNNY"],
            },
            videoProviderId: {
              type: "string",
              nullable: true,
              description: "Protected video host identifier",
            },
            isFreePreview: {
              type: "boolean",
              example: false,
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
            provider: {
              type: "string",
              enum: ["SUPABASE", "BUNNY"],
            },
            endpoint: {
              type: "string",
              format: "uri",
              description: "Bunny TUS upload endpoint",
            },
            headers: {
              type: "object",
              description: "Short-lived Bunny TUS authorization headers",
            },
            videoId: {
              type: "string",
              description: "Bunny Stream video identifier",
            },
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
              description: "Temporary tokenized embed or signed playback URL",
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
            playbackType: {
              type: "string",
              enum: ["embed", "file"],
            },
            provider: {
              type: "string",
              enum: ["BUNNY", "SUPABASE"],
            },
            watermark: {
              type: "object",
              properties: {
                email: { type: "string" },
                userId: { oneOf: [{ type: "integer" }, { type: "string" }] },
              },
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
            employmentType: { type: "string", enum: ["FULL_TIME", "PART_TIME", "INTERNSHIP"], example: "FULL_TIME" },
            experienceLevel: { type: "string", nullable: true, enum: ["ENTRY_LEVEL", "JUNIOR", "MID_LEVEL", "SENIOR"], example: "JUNIOR" },
            salaryMin: { type: "integer", nullable: true, minimum: 0, example: 1000 },
            salaryMax: { type: "integer", nullable: true, minimum: 0, example: 1800 },
            salaryCurrency: { type: "string", example: "AZN" },
            companyLogoUrl: { type: "string", format: "uri", nullable: true },
          },
        },

        JobInput: {
          type: "object",
          required: ["title", "courseId"],
          properties: {
            title: {
              type: "string",
              example: "Junior Frontend Developer",
            },
            company: {
              type: "string",
              nullable: true,
              example: "Synex Academy",
            },
            location: {
              type: "string",
              nullable: true,
              example: "Bakı",
            },
            description: {
              type: "string",
              nullable: true,
              example: "Frontend komandamıza yeni əməkdaş axtarırıq.",
            },
            url: {
              type: "string",
              format: "uri",
              nullable: true,
              example: "https://example.com/apply",
            },
            careerId: {
              type: "integer",
              nullable: true,
              minimum: 1,
              example: 1,
            },
            courseId: {
              type: "integer",
              minimum: 1,
              example: 1,
              description: "Administrator tərəfindən idarə olunan kurs identifikatoru",
            },
            employmentType: { type: "string", enum: ["FULL_TIME", "PART_TIME", "INTERNSHIP"], default: "FULL_TIME" },
            experienceLevel: { type: "string", nullable: true, enum: ["ENTRY_LEVEL", "JUNIOR", "MID_LEVEL", "SENIOR"] },
            salaryMin: { type: "integer", nullable: true, minimum: 0, example: 1000 },
            salaryMax: { type: "integer", nullable: true, minimum: 0, example: 1800 },
            salaryCurrency: { type: "string", minLength: 3, maxLength: 3, example: "AZN" },
            companyLogoUrl: { type: "string", format: "uri", nullable: true, example: "https://example.com/logo.png" },
          },
        },

        Application: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            status: {
              type: "string",
              enum: ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"],
              example: "PENDING",
            },
            userId: {
              type: "integer",
              example: 1,
            },
            jobId: {
              type: "integer",
              example: 1,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
            job: {
              $ref: "#/components/schemas/Job",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
          },
        },

        Article: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "Kibertəhlükəsizlikdə ilk addımlar" },
            slug: { type: "string", example: "kibertehlukesizlikde-ilk-addimlar" },
            summary: { type: "string", nullable: true },
            content: { type: "string" },
            published: { type: "boolean", example: true },
            publishedAt: { type: "string", format: "date-time", nullable: true },
          },
        },

        Plan: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Aylıq Premium" },
            code: { type: "string", example: "monthly-premium" },
            price: { type: "number", format: "decimal", example: 19.9 },
            currency: { type: "string", example: "AZN" },
            interval: { type: "string", example: "MONTHLY" },
            active: { type: "boolean", example: true },
          },
        },

        Payment: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            amount: { type: "number", format: "decimal", example: 19.9 },
            currency: { type: "string", example: "AZN" },
            status: { type: "string", example: "SUCCEEDED" },
            provider: { type: "string", example: "STRIPE" },
            createdAt: { type: "string", format: "date-time" },
            plan: { $ref: "#/components/schemas/Plan" },
          },
        },

        Subscription: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            status: { type: "string", example: "ACTIVE" },
            startsAt: { type: "string", format: "date-time" },
            endsAt: { type: "string", format: "date-time" },
            cancelAtPeriodEnd: { type: "boolean", example: false },
            plan: { $ref: "#/components/schemas/Plan" },
          },
        },

        CorporateInquiry: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            companyName: { type: "string", example: "Synex MMC" },
            contactName: { type: "string", example: "Aysel Məmmədova" },
            email: { type: "string", format: "email" },
            phone: { type: "string", nullable: true },
            employeeCount: { type: "integer", nullable: true, example: 25 },
            message: { type: "string" },
            status: { type: "string", enum: ["NEW", "CONTACTED", "CLOSED"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },

  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
