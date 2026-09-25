import {
  Github,
  Heart,
  Info,
  Map,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

function Footer() {
  const currentYear = new Date().getFullYear();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "ADMIN";

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
            Synex Academy gəncləri praktiki təlim, qiymətləndirmə,
            sertifikatlaşdırma və real karyera imkanları ilə birləşdirən
            təhsil və məşğulluq platformasıdır.
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
            {isAuthenticated && (
              <li>
                <Link to={isAdmin ? "/admin/applications" : "/applications/me"}>
                  {isAdmin ? "Müraciətlər" : "Müraciətlərim"}
                </Link>
              </li>
            )}
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
              <Link to="/about">
                <Info size={17} />
                Haqqımızda
              </Link>
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
