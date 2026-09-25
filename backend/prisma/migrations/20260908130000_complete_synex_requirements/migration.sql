ALTER TABLE "User" ADD COLUMN "careerAutoApplyEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Application" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "LessonProgress" ADD COLUMN "lastHeartbeatAt" TIMESTAMP(3);

CREATE TABLE "LessonResource" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "fileType" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lessonId" INTEGER NOT NULL,
    CONSTRAINT "LessonResource_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LessonResource_lessonId_url_key" ON "LessonResource"("lessonId", "url");
CREATE INDEX "LessonResource_lessonId_idx" ON "LessonResource"("lessonId");
ALTER TABLE "LessonResource" ADD CONSTRAINT "LessonResource_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
