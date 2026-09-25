require("dotenv").config();

const prisma = require(
  "../src/lib/prisma",
);

async function main() {
  let course = await prisma.course.findFirst({
    where: {
      title: "Frontend Development",
    },
  });

  if (!course) {
    course = await prisma.course.create({
      data: {
        title: "Frontend Development",
        description:
          "Frontend proqramlaşdırmanın əsaslarını öyrənmək üçün demo kurs.",
        published: true,
      },
    });
  }

  let courseModule =
    await prisma.courseModule.findFirst({
      where: {
        courseId: course.id,
        title: "HTML əsasları",
      },
    });

  if (!courseModule) {
    courseModule =
      await prisma.courseModule.create({
        data: {
          title: "HTML əsasları",
          description:
            "HTML sənəd strukturu və əsas elementlər.",
          order: 1,
          courseId: course.id,
        },
      });
  }

  let lesson = await prisma.lesson.findFirst({
    where: {
      moduleId: courseModule.id,
      title: "HTML ilə ilk addım",
    },
  });

  if (!lesson) {
    lesson = await prisma.lesson.create({
      data: {
        title: "HTML ilə ilk addım",
        description:
          "HTML sənədinin əsas strukturunu öyrənirik.",
        order: 1,
        published: true,
        moduleId: courseModule.id,
      },
    });
  }

  console.log("Demo video məlumatları hazırdır:");
  console.log("Course ID:", course.id);
  console.log("Module ID:", courseModule.id);
  console.log("Lesson ID:", lesson.id);
}

main()
  .catch((error) => {
    console.error(
      "Demo məlumat yaradılarkən xəta:",
      error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });