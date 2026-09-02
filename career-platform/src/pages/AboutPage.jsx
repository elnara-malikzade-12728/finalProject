import { Award, BookOpen, BriefcaseBusiness, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container centered-heading">
          <span className="eyebrow">Synex Academy</span>
          <h1>Haqqımızda</h1>
          <p>
            Gənclərin biliklərini praktik bacarıqlara, bacarıqlarını isə real
            karyera imkanlarına çevirməsinə kömək edən təhsil platformasıyıq.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="centered-heading">
            <span className="eyebrow">Missiyamız</span>
            <h2>Təhsildən məşğulluğa aydın yol</h2>
            <p>
              Synex Academy strukturlaşdırılmış kursları, qorunan video
              dərsləri, qiymətləndirmələri, yoxlanılan sertifikatları və
              vakansiyaları vahid platformada birləşdirir.
            </p>
          </div>

          <div className="steps-grid">
            <article className="process-card">
              <BookOpen size={30} aria-hidden="true" />
              <h3>Praktiki təlim</h3>
              <p>Ardıcıl modullar, video dərslər və bilik yoxlamaları.</p>
            </article>
            <article className="process-card">
              <Award size={30} aria-hidden="true" />
              <h3>Etibarlı nəticə</h3>
              <p>Yekun imtahan və açıq şəkildə yoxlanılan sertifikatlar.</p>
            </article>
            <article className="process-card">
              <BriefcaseBusiness size={30} aria-hidden="true" />
              <h3>Karyera imkanları</h3>
              <p>Kurslardan vakansiyalara və iş müraciətlərinə keçid.</p>
            </article>
            <article className="process-card">
              <Building2 size={30} aria-hidden="true" />
              <h3>Korporativ həllər</h3>
              <p>Şirkətlər üçün komanda təlimi və prioritet vakansiyalar.</p>
            </article>
          </div>

          <div className="centered-heading">
            <Link className="button button-primary" to="/courses">Kursları kəşf et</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default AboutPage;
