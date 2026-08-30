import { useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CreditCard,
  FileText,
  LogOut,
  Map,
  Menu,
  Newspaper,
  UserRound,
  ListChecks,
  X,
} from "lucide-react";
import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const shouldShowPublicNavigation =
    !isAdminRoute && user?.role !== "ADMIN";

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
    navigate("/");
  }

  function getNavLinkClass({ isActive }) {
    return isActive ? "nav-link nav-link-active" : "nav-link";
  }

  return (
    <header className="site-header">
      <div className="container navbar">
        <NavLink
          to="/"
          className="brand"
          onClick={closeMenu}
          aria-label="Synex Academy ana səhifə"
        >
          <span className="brand-icon" aria-hidden="true">
            <Map size={23} strokeWidth={2.5} />
          </span>

          <span>
            Synex <span className="brand-accent">Academy</span>
          </span>
        </NavLink>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          aria-label={isMenuOpen ? "Menyunu bağla" : "Menyunu aç"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav
          id="primary-navigation"
          className={`nav-content ${isMenuOpen ? "nav-content-open" : ""}`}
          aria-label="Əsas naviqasiya"
        >
          {shouldShowPublicNavigation && (
            <div className="nav-links">
              <NavLink
                to="/courses"
                className={getNavLinkClass}
                onClick={closeMenu}
              >
                <Map size={18} />
                Kurslar
              </NavLink>

              <NavLink
                to="/jobs"
                className={getNavLinkClass}
                onClick={closeMenu}
              >
                <BriefcaseBusiness size={18} />
                Vakansiyalar
              </NavLink>

              <NavLink
                to="/pricing"
                className={getNavLinkClass}
                onClick={closeMenu}
              >
                <CreditCard size={18} />
                Qiymətlər
              </NavLink>

              <NavLink
                to="/articles"
                className={getNavLinkClass}
                onClick={closeMenu}
              >
                <Newspaper size={18} />
                Məqalələr
              </NavLink>

              <NavLink
                to="/corporate"
                className={getNavLinkClass}
                onClick={closeMenu}
              >
                <Building2 size={18} />
                Korporativ
              </NavLink>

              {isAuthenticated && user?.role !== "ADMIN" && (
                <>
                  <NavLink
                    to="/tests"
                    className={getNavLinkClass}
                    onClick={closeMenu}
                  >
                    <ListChecks size={18} />
                    Testlər
                  </NavLink>
                  <NavLink
                    to="/applications/me"
                    className={getNavLinkClass}
                    onClick={closeMenu}
                  >
                    <FileText size={18} />
                    Müraciətlərim
                  </NavLink>

                  <NavLink
                    to="/certificates"
                    className={getNavLinkClass}
                    onClick={closeMenu}
                  >
                    <FileText size={18} />
                    Sertifikatlar
                  </NavLink>

                  <NavLink
                    to="/profile/subscription"
                    className={getNavLinkClass}
                    onClick={closeMenu}
                  >
                    <CreditCard size={18} />
                    Abunəliyim
                  </NavLink>
                </>
              )}
            </div>
          )}

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/profile"
                  className="user-link"
                  onClick={closeMenu}
                >
                  <span className="user-avatar" aria-hidden="true">
                    {user?.name?.charAt(0).toUpperCase() || (
                      <UserRound size={17} />
                    )}
                  </span>

                  <span className="user-link-text">
                    <small>Hesabım</small>
                    <strong>{user?.name}</strong>
                  </span>
                </NavLink>

                <button
                  type="button"
                  className="button button-ghost logout-button"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  Çıxış
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="button button-ghost"
                  onClick={closeMenu}
                >
                  Daxil ol
                </NavLink>

                <NavLink
                  to="/register"
                  className="button button-primary"
                  onClick={closeMenu}
                >
                  Başla
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;