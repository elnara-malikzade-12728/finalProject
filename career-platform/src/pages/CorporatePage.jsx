import { Building2, CheckCircle2, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const benefits = [
  "Komandanız üçün fərdiləşdirilmiş təlim planı",
  "Bütün Pro kurslara toplu giriş",
  "Şəxsi hesab meneceri və proqres izləmə",
  "Korporativ hesab-faktura və müqavilə",
];

function CorporatePage() {
  const navigate = useNavigate();

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-content">
          <span className="eyebrow">
            <Building2 size={17} aria-hidden="true" />
            Korporativ paket
          </span>

          <h1>Komandanız üçün öyrənmə həlli</h1>

          <p>
            Şirkətinizin komandası üçün toplu təlim paketi təklif edirik.
            Ehtiyaclarınıza uyğun fərdi təklif üçün bizimlə əlaqə saxlayın.
          </p>

          <button
            type="button"
            className="button button-primary"
            onClick={() => navigate("/corporate/contact")}
          >
            <Mail size={16} aria-hidden="true" />
            Bizimlə əlaqə saxlayın
          </button>
          <button type="button" className="button button-secondary" onClick={() => navigate("/corporate/dashboard")}>
            <Building2 size={16} aria-hidden="true" /> Şirkət panelinə keçin
          </button>
        </div>
      </section>

      <section className="section jobs-section">
        <div className="container">
          <div className="results-heading">
            <div>
              <h2>Paketə daxildir</h2>
            </div>
          </div>

          <div className="simple-card-grid">
            {benefits.map((benefit) => (
              <article key={benefit} className="simple-card">
                <CheckCircle2 size={22} aria-hidden="true" />
                <h3>{benefit}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default CorporatePage;
