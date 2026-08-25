import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  Clock3,
  Route,
  Signal,
  TrendingUp,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getCareerById } from "../data/careers.js";
import { jobs } from "../data/jobs.js";

function CareerDetailsPage() {
  const { careerId } = useParams();
  const career = getCareerById(careerId);

  if (!career) {
    return (
      <section className="section">
        <div className="container empty-state">
          <Route size={44} aria-hidden="true" />
          <h1>Kurs tapılmadı</h1>
          <p>
            Axtardığınız karyera istiqaməti mövcud deyil və ya
            silinib.
          </p>

          <Link to="/careers" className="button button-primary">
            <ArrowLeft size={18} />
            Kurslara qayıt
          </Link>
        </div>
      </section>
    );
  }

  const relatedJobs = jobs.filter(
    (job) => job.careerId === career.id,
  );

  return (
    <>
      <section className="career-detail-hero">
        <div className="container">
          <Link to="/careers" className="back-link">
            <ArrowLeft size={18} aria-hidden="true" />
            Bütün kurslar
          </Link>

          <div className="career-detail-heading">
            <div>
              <span className="tag">{career.category}</span>
              <h1>{career.title}</h1>
              <p>{career.description}</p>
            </div>

            <Link
              to={`/roadmap/${career.id}`}
              className="button button-primary button-large"
            >
              Yol xəritəsinə başla
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          </div>

          <div className="career-overview">
            <div className="career-overview-item">
              <Clock3 size={22} aria-hidden="true" />
              <div>
                <span>Təxmini müddət</span>
                <strong>{career.duration}</strong>
              </div>
            </div>

            <div className="career-overview-item">
              <Signal size={22} aria-hidden="true" />
              <div>
                <span>Səviyyə</span>
                <strong>{career.level}</strong>
              </div>
            </div>

            <div className="career-overview-item">
              <TrendingUp size={22} aria-hidden="true" />
              <div>
                <span>Əmək bazarında tələb</span>
                <strong>{career.demand}</strong>
              </div>
            </div>

            <div className="career-overview-item">
              <BriefcaseBusiness size={22} aria-hidden="true" />
              <div>
                <span>Uyğun imkanlar</span>
                <strong>{relatedJobs.length} elan</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container career-detail-grid">
          <div className="career-detail-main">
            <div className="content-card">
              <div className="content-card-heading">
                <BookOpenCheck size={25} aria-hidden="true" />
                <div>
                  <h2>Tələb olunan bacarıqlar</h2>
                  <p>
                    Bu istiqamətdə inkişaf etmək üçün əsas bilik və
                    bacarıqlar.
                  </p>
                </div>
              </div>

              <ul className="skills-list">
                {career.skills.map((skill) => (
                  <li key={skill}>
                    <span aria-hidden="true">
                      <Check size={17} />
                    </span>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>

            <div className="content-card">
              <div className="content-card-heading">
                <Route size={25} aria-hidden="true" />
                <div>
                  <h2>Yol xəritəsinə baxış</h2>
                  <p>
                    Məqsədinə çatmaq üçün tamamlayacağın əsas mərhələlər.
                  </p>
                </div>
              </div>

              <ol className="roadmap-preview">
                {career.roadmap.map((step, index) => (
                  <li key={step.id}>
                    <span className="roadmap-preview-number">
                      {index + 1}
                    </span>

                    <div>
                      <span className="step-type">{step.type}</span>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                      <small>{step.duration}</small>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <aside className="career-detail-sidebar">
            <div className="sidebar-card">
              <h2>İnkişafa başlamağa hazırsan?</h2>
              <p>
                Addımları tamamla, irəliləyişini izlə və uyğun
                vakansiyaları kəşf et.
              </p>

              <Link
                to={`/roadmap/${career.id}`}
                className="button button-primary"
              >
                Yol xəritəsini aç
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>

            <div className="sidebar-card">
              <h2>Uyğun imkanlar</h2>
              <p>
                Bu istiqamət üzrə {relatedJobs.length} vakansiya və
                təcrübə proqramı mövcuddur.
              </p>

              <Link
                to={`/jobs?career=${career.id}`}
                className="button button-secondary"
              >
                Elanlara bax
                <BriefcaseBusiness size={18} aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

export default CareerDetailsPage;
