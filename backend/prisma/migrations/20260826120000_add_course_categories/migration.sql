CREATE TABLE "CourseCategory" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CourseCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CourseCategory_name_key" ON "CourseCategory"("name");
ALTER TABLE "Course" ADD COLUMN "categoryId" INTEGER;
CREATE INDEX "Course_categoryId_idx" ON "Course"("categoryId");
ALTER TABLE "Course" ADD CONSTRAINT "Course_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "CourseCategory"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
