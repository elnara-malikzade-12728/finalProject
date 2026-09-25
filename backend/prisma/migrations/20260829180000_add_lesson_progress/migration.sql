CREATE TABLE "LessonProgress" (
    "id" SERIAL NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "lessonId" INTEGER NOT NULL,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LessonProgress_userId_lessonId_key"
ON "LessonProgress"("userId", "lessonId");

CREATE INDEX "LessonProgress_userId_idx" ON "LessonProgress"("userId");
CREATE INDEX "LessonProgress_lessonId_idx" ON "LessonProgress"("lessonId");

ALTER TABLE "LessonProgress"
ADD CONSTRAINT "LessonProgress_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LessonProgress"
ADD CONSTRAINT "LessonProgress_lessonId_fkey"
FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
