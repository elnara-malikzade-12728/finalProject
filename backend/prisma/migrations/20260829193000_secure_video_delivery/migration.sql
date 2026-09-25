CREATE TYPE "VideoProvider" AS ENUM ('SUPABASE', 'BUNNY');

ALTER TABLE "Lesson"
  ADD COLUMN "videoProvider" "VideoProvider",
  ADD COLUMN "videoProviderId" TEXT,
  ADD COLUMN "isFreePreview" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Lesson"
SET "videoProvider" = 'SUPABASE'
WHERE "videoPath" IS NOT NULL;

CREATE UNIQUE INDEX "Lesson_videoProviderId_key" ON "Lesson"("videoProviderId");

ALTER TABLE "LessonProgress"
  ADD COLUMN "watchedPercentage" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastPositionSeconds" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "LessonProgress"
  ADD CONSTRAINT "LessonProgress_watchedPercentage_check"
  CHECK ("watchedPercentage" BETWEEN 0 AND 100);
