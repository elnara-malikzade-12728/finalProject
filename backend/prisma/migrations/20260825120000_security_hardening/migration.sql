-- Remove duplicate progress rows before enforcing integrity.
DELETE FROM "Progress" duplicate
USING "Progress" retained
WHERE duplicate."userId" = retained."userId"
  AND duplicate."stepId" = retained."stepId"
  AND duplicate."id" < retained."id";

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "tokenVersion" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS "Progress_userId_stepId_key"
  ON "Progress"("userId", "stepId");

ALTER TABLE "Step" DROP CONSTRAINT IF EXISTS "Step_careerId_fkey";
ALTER TABLE "Step"
  ADD CONSTRAINT "Step_careerId_fkey"
  FOREIGN KEY ("careerId") REFERENCES "Career"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Progress" DROP CONSTRAINT IF EXISTS "Progress_userId_fkey";
ALTER TABLE "Progress"
  ADD CONSTRAINT "Progress_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Progress" DROP CONSTRAINT IF EXISTS "Progress_stepId_fkey";
ALTER TABLE "Progress"
  ADD CONSTRAINT "Progress_stepId_fkey"
  FOREIGN KEY ("stepId") REFERENCES "Step"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Job" DROP CONSTRAINT IF EXISTS "Job_careerId_fkey";
ALTER TABLE "Job"
  ADD CONSTRAINT "Job_careerId_fkey"
  FOREIGN KEY ("careerId") REFERENCES "Career"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Application" DROP CONSTRAINT IF EXISTS "Application_userId_fkey";
ALTER TABLE "Application"
  ADD CONSTRAINT "Application_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Application" DROP CONSTRAINT IF EXISTS "Application_jobId_fkey";
ALTER TABLE "Application"
  ADD CONSTRAINT "Application_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "Job"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
