CREATE TABLE "Company" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "logoUrl" TEXT,
  "ownerId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Company_ownerId_key" ON "Company"("ownerId");
ALTER TABLE "Company" ADD CONSTRAINT "Company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CompanyMember" (
  "id" SERIAL NOT NULL,
  "companyId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompanyMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CompanyMember_companyId_userId_key" ON "CompanyMember"("companyId", "userId");
CREATE INDEX "CompanyMember_userId_idx" ON "CompanyMember"("userId");
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Job" ADD COLUMN "companyAccountId" INTEGER, ADD COLUMN "isPriority" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "Job_companyAccountId_idx" ON "Job"("companyAccountId");
CREATE INDEX "Job_isPriority_idx" ON "Job"("isPriority");
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyAccountId_fkey" FOREIGN KEY ("companyAccountId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
