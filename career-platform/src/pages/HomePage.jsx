import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Map,
  Target,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import CareerCard from "../components/common/CareerCard.jsx";
import { careers } from "../data/careers.js";

function HomePage() {
  const featuredCareers = careers.slice(0, 3);

  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="eyebrow">
              <Target size={17} aria-hidden="true" />
              Gələcəyinə bu gün istiqamət ver
            </span>

            <h1>
              Karyera məqsədini seç,
              <span> yol xəritəni qur.</span>
            </h1>

            <p className="hero-description">
              Bacarıqlarına və maraqlarına uyğun peşəni kəşf et,
              addım-addım inkişaf planı əldə et və uyğun iş
              imkanlarına daha hazırlıqlı ol.
            </p>

            <div className="hero-actions">
              <Link to="/careers" className="button button-primary button-large">
                Peşələri kəşf et
                <ArrowRight size={19} aria-hidden="true" />
              </Link>

              <Link to="/jobs" className="button button-secondary button-large">
                Vakansiyalara bax
              </Link>
            </div>

            <ul className="hero-benefits" aria-label="Platformanın üstünlükləri">
              <li>
                <CheckCircle2 size={18} aria-hidden="true" />
                Pulsuz istifadə
              </li>
              <li>
                <CheckCircle2 size={18} aria-hidden="true" />
                Praktik yol xəritələri
              </li>
              <li>
                <CheckCircle2 size={18} aria-hidden="true" />
                Real karyera imkanları
              </li>
            </ul>
          </div>

          <div className="hero-visual" aria-label="Karyera inkişaf nümunəsi">
            <div className="hero-visual-header">
              <div>
                <span>Seçilmiş istiqamət</span>
                <strong>Frontend Developer</strong>
              </div>

              <span className="hero-percentage">67%</span>
            </div>

            <div
              className="progress-track"
              role="progressbar"
              aria-valuenow="67"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Frontend Developer yol xəritəsi irəliləyişi"
            >
              <span style={{ width: "67%" }} />
            </div>

            <div className="hero-step hero-step-completed">
              <span className="hero-step-number">
                <CheckCircle2 size={19} />
              </span>
              <div>
                <strong>HTML və CSS</strong>
                <small>Tamamlandı</small>
              </div>
            </div>

            <div className="hero-step hero-step-completed">
              <span className="hero-step-number">
                <CheckCircle2 size={19} />
              </span>
              <div>
                <strong>JavaScript əsasları</strong>
                <small>Tamamlandı</small>
              </div>
            </div>

            <div className="hero-step hero-step-current">
              <span className="hero-step-number">3</span>
              <div>
                <strong>React ilə layihə</strong>
                <small>Hazırda davam edir</small>
              </div>
            </div>

            <div className="hero-step">
              <span className="hero-step-number">4</span>
              <div>
                <strong>Təcrübə proqramı</strong>
                <small>Növbəti addım</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section" aria-label="Platforma göstəriciləri">
        <div className="container stats-grid">
          <div className="stat-item">
            <Map size={28} aria-hidden="true" />
            <div>
              <strong>5+</strong>
              <span>Peşə istiqaməti</span>
            </div>
          </div>

          <div className="stat-item">
            <BriefcaseBusiness size={28} aria-hidden="true" />
            <div>
              <strong>10+</strong>
              <span>İş və təcrübə imkanı</span>
            </div>
          </div>

          <div className="stat-item">
            <Target size={28} aria-hidden="true" />
            <div>
              <strong>30+</strong>
              <span>İnkişaf addımı</span>
            </div>
          </div>

          <div className="stat-item">
            <UsersRound size={28} aria-hidden="true" />
            <div>
              <strong>100%</strong>
              <span>Gənclər üçün</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Populyar istiqamətlər</span>
              <h2>Özünə uyğun peşəni kəşf et</h2>
              <p>
                Maraqlarına uyğun istiqaməti seç və tələb olunan
                bacarıqları addım-addım öyrən.
              </p>
            </div>

            <Link to="/careers" className="text-link">
              Bütün peşələr
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>

          <div className="card-grid">
            {featuredCareers.map((career) => (
              <CareerCard key={career.id} career={career} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="centered-heading">
            <span className="eyebrow">Necə işləyir?</span>
            <h2>Karyerana üç sadə addımla başla</h2>
            <p>
              Məqsədini müəyyənləşdir, inkişaf yolunu izlə və yeni
              imkanlara hazırlaş.
            </p>
          </div>

          <div className="steps-grid">
            <article className="process-card">
              <span className="process-number">01</span>
              <Target size={30} aria-hidden="true" />
              <h3>Peşəni seç</h3>
              <p>
                Maraqlarına və məqsədlərinə uyğun karyera istiqamətini
                müəyyən et.
              </p>
            </article>

            <article className="process-card">
              <span className="process-number">02</span>
              <Map size={30} aria-hidden="true" />
              <h3>Yol xəritəni izlə</h3>
              <p>
                Lazım olan bilik və praktik addımları ardıcıllıqla
                tamamla.
              </p>
            </article>

            <article className="process-card">
              <span className="process-number">03</span>
              <BriefcaseBusiness size={30} aria-hidden="true" />
              <h3>İmkanını tap</h3>
              <p>
                Bacarıqlarına uyğun vakansiya və təcrübə proqramlarını
                kəşf et.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-panel">
            <div>
              <span className="eyebrow eyebrow-light">
                İlk addımını at
              </span>
              <h2>Karyera yolunu qurmağa hazırsan?</h2>
              <p>
                Pulsuz hesab yarat, peşəni seç və inkişafını izləməyə
                başla.
              </p>
            </div>

            <Link to="/register" className="button button-light button-large">
              Pulsuz başla
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;