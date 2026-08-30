-- Assessment, certificate and CV additions for the existing Synex Academy schema.
-- This migration is intentionally incremental: existing enums and tables are preserved.

CREATE TYPE "TestType" AS ENUM ('LESSON', 'FINAL');
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'EXPIRED');

ALTER TABLE "User"
  ADD COLUMN "cvFilePath" TEXT,
  ADD COLUMN "cvOriginalName" TEXT;

ALTER TABLE "Application"
  ADD COLUMN "cvFilePathAtApplication" TEXT,
  ADD COLUMN "coverLetter" TEXT;

CREATE TABLE "Test" (
  "id" SERIAL NOT NULL,
  "title" TEXT NOT NULL,
  "type" "TestType" NOT NULL,
  "lessonId" INTEGER,
  "courseId" INTEGER,
  "passScorePercent" INTEGER NOT NULL,
  "timeLimitMinutes" INTEGER,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Question" (
  "id" SERIAL NOT NULL,
  "testId" INTEGER NOT NULL,
  "questionText" TEXT NOT NULL,
  "options" JSONB NOT NULL,
  "correctValue" JSONB NOT NULL,
  "order" INTEGER NOT NULL,
  CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TestAttempt" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "testId" INTEGER NOT NULL,
  "score" DOUBLE PRECISION,
  "passed" BOOLEAN,
  "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "submittedAt" TIMESTAMP(3),
  CONSTRAINT "TestAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TestAnswer" (
  "id" SERIAL NOT NULL,
  "attemptId" INTEGER NOT NULL,
  "questionId" INTEGER NOT NULL,
  "answer" JSONB,
  "correct" BOOLEAN,
  CONSTRAINT "TestAnswer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Certificate" (
  "id" SERIAL NOT NULL,
  "code" TEXT NOT NULL,
  "userId" INTEGER NOT NULL,
  "courseId" INTEGER NOT NULL,
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "pdfPath" TEXT,
  "finalScore" DOUBLE PRECISION,
  CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Test_lessonId_idx" ON "Test"("lessonId");
CREATE INDEX "Test_courseId_idx" ON "Test"("courseId");
CREATE INDEX "Test_published_idx" ON "Test"("published");
CREATE INDEX "Question_testId_order_idx" ON "Question"("testId", "order");
CREATE INDEX "TestAttempt_userId_idx" ON "TestAttempt"("userId");
CREATE INDEX "TestAttempt_testId_idx" ON "TestAttempt"("testId");
CREATE INDEX "TestAttempt_status_idx" ON "TestAttempt"("status");
CREATE UNIQUE INDEX "TestAnswer_attemptId_questionId_key" ON "TestAnswer"("attemptId", "questionId");
CREATE UNIQUE INDEX "Certificate_code_key" ON "Certificate"("code");
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");
CREATE INDEX "Certificate_courseId_idx" ON "Certificate"("courseId");

ALTER TABLE "Test" ADD CONSTRAINT "Test_lessonId_fkey"
  FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Test" ADD CONSTRAINT "Test_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_testId_fkey"
  FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_testId_fkey"
  FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TestAnswer" ADD CONSTRAINT "TestAnswer_attemptId_fkey"
  FOREIGN KEY ("attemptId") REFERENCES "TestAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TestAnswer" ADD CONSTRAINT "TestAnswer_questionId_fkey"
  FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
