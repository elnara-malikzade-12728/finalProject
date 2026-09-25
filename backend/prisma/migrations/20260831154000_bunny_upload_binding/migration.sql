ALTER TABLE "Lesson"
ADD COLUMN "pendingVideoProviderId" TEXT,
ADD COLUMN "pendingVideoExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Lesson_pendingVideoProviderId_key"
ON "Lesson"("pendingVideoProviderId");
