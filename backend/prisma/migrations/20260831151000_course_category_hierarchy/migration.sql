ALTER TABLE "CourseCategory" ADD COLUMN "parentId" INTEGER;
ALTER TABLE "CourseCategory" ADD CONSTRAINT "CourseCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CourseCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "CourseCategory_parentId_idx" ON "CourseCategory"("parentId");

INSERT INTO "CourseCategory" ("name", "description", "order", "createdAt", "updatedAt") VALUES
('Karyera və Şəxsi İnkişaf', 'Career & Soft Skills', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Rəqəmsal və Texnoloji Bacarıqlar', 'Tech & Digital Skills', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Biznes və Maliyyə', 'Business & Finance', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Sahəvi Professional Təlimlər', 'Industry Specific', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "CourseCategory" ("name", "description", "order", "parentId", "createdAt", "updatedAt")
SELECT item.name, item.description, item.sort_order, parent.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
  ('Karyera və Şəxsi İnkişaf', 'CV və Motivasiya Məktubu', 'ATS uyğun CV və motivasiya məktubu', 1),
  ('Karyera və Şəxsi İnkişaf', 'Müsahibə Hazırlığı', 'HR və texniki müsahibələr, bədən dili və stress idarəsi', 2),
  ('Karyera və Şəxsi İnkişaf', 'Liderlik və İdarəetmə', 'Komanda işi, liderlik və münaqişələrin həlli', 3),
  ('Karyera və Şəxsi İnkişaf', 'Effektiv Kommunikasiya', 'Ünsiyyət etikası, vaxt idarəsi və emosional intellekt', 4),
  ('Rəqəmsal və Texnoloji Bacarıqlar', 'İT və Proqramlaşdırma', 'Frontend, backend və data analitika', 1),
  ('Rəqəmsal və Texnoloji Bacarıqlar', 'Rəqəmsal Marketinq', 'SMM, SEO, Google Ads və Meta reklamları', 2),
  ('Rəqəmsal və Texnoloji Bacarıqlar', 'Süni İntellekt (AI)', 'ChatGPT, Midjourney və iş üçün AI alətləri', 3),
  ('Rəqəmsal və Texnoloji Bacarıqlar', 'Ofis Proqramları', 'Excel, PowerPoint və layihə idarəetməsi', 4),
  ('Biznes və Maliyyə', 'Biznes Konsultasiyası', 'Startap, biznes modeli və strateji planlama', 1),
  ('Biznes və Maliyyə', 'Maliyyə Savadlılığı', 'Şəxsi və korporativ maliyyə, büdcələşdirmə', 2),
  ('Biznes və Maliyyə', 'Satış və Danışıqlar', 'B2B/B2C satış, etirazlar və danışıqlar', 3),
  ('Sahəvi Professional Təlimlər', 'İnsan Resursları (HR)', 'Recruitment, kadr işi və Əmək Məcəlləsi', 1),
  ('Sahəvi Professional Təlimlər', 'Hüquq və Audit', 'Biznes hüququ, müqavilələr, vergi və audit', 2),
  ('Sahəvi Professional Təlimlər', 'Müştəri Xidmətləri', 'NPS, şikayət idarəsi və Call Center etikası', 3)
) AS item(parent_name, name, description, sort_order)
JOIN "CourseCategory" parent ON parent.name = item.parent_name
ON CONFLICT ("name") DO NOTHING;
