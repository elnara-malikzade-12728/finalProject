CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERNSHIP');
CREATE TYPE "ExperienceLevel" AS ENUM ('ENTRY_LEVEL', 'JUNIOR', 'MID_LEVEL', 'SENIOR');

ALTER TABLE "Job"
  ADD COLUMN "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
  ADD COLUMN "experienceLevel" "ExperienceLevel",
  ADD COLUMN "salaryMin" INTEGER,
  ADD COLUMN "salaryMax" INTEGER,
  ADD COLUMN "salaryCurrency" TEXT NOT NULL DEFAULT 'AZN',
  ADD COLUMN "companyLogoUrl" TEXT;

CREATE INDEX "Job_employmentType_idx" ON "Job"("employmentType");
CREATE INDEX "Job_experienceLevel_idx" ON "Job"("experienceLevel");
