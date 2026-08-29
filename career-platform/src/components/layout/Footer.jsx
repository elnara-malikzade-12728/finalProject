import {
  Github,
  Heart,
  Mail,
  Map,
} from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-about">
          <Link
            to="/"
            className="brand footer-brand"
            aria-label="Synex Academy ana səhifə"
          >
            <span className="brand-icon" aria-hidden="true">
              <Map size={23} strokeWidth={2.5} />
            </span>

            <span>
              Synex <span className="brand-accent">Academy</span>
            </span>
          </Link>

          <p>
            Gənclərə uyğun kurs seçmək, bacarıqlarını inkişaf
            etdirmək və karyera imkanları tapmaq üçün yaradılmış
            platforma.
          </p>
        </div>

        <div className="footer-column">
          <h2>Platforma</h2>

          <ul>
            <li>
              <Link to="/courses">Kurslar</Link>
            </li>
            <li>
              <Link to="/jobs">Vakansiyalar</Link>
            </li>
            <li>
              <Link to="/applications/me">Müraciətlərim</Link>
            </li>
            <li>
              <Link to="/profile">Profilim</Link>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h2>Layihə</h2>

          <ul>
            <li>
              <a
                href="https://github.com/elnara-malikzade-12728/finalProject"
                target="_blank"
                rel="noreferrer"
              >
                <Github size={17} />
                GitHub
              </a>
            </li>

            <li>
              <a href="mailto:info@karyerayol.az">
                <Mail size={17} />
                Əlaqə
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {currentYear} Synex Academy. Bütün hüquqlar qorunur.</p>

        <p className="footer-project-note">
          <Heart size={16} fill="currentColor" aria-hidden="true" />
          Holberton School final layihəsi
        </p>
      </div>
    </footer>
  );
}

export default Footer;
