import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Map,
} from "lucide-react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const {
    user,
    login,
    isAuthenticated,
    isInitializing,
  } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const redirectMessage =
    location.state?.message;

  function getDestinationForRole(role) {
    if (role === "ADMIN") {
      return "/admin";
    }

    return "/careers";
  }

  if (!isInitializing && isAuthenticated) {
    return (
      <Navigate
        to={getDestinationForRole(user?.role)}
        replace
      />
    );
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !formData.email.trim() ||
      !formData.password
    ) {
      setError(
        "E-poçt və şifrə sahələrini doldurun.",
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await login(
        formData.email,
        formData.password,
      );

      if (!result.success) {
        setError(
          result.message ||
            "Hesaba daxil olmaq mümkün olmadı.",
        );
        return;
      }

      navigate(
        getDestinationForRole(
          result.user?.role,
        ),
        {
          replace: true,
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-section">
      <div className="container auth-container">
        <div className="auth-card">
          <Link
            to="/"
            className="auth-brand"
            aria-label="KaryeraYol ana səhifə"
          >
            <span
              className="brand-icon"
              aria-hidden="true"
            >
              <Map
                size={23}
                strokeWidth={2.5}
              />
            </span>

            <span>
              Karyera
              <span className="brand-accent">
                Yol
              </span>
            </span>
          </Link>

          <div className="auth-heading">
            <h1>Yenidən xoş gəldin</h1>

            <p>
              Yol xəritənə və karyera
              imkanlarına davam etmək üçün
              hesabına daxil ol.
            </p>
          </div>

          {redirectMessage && (
            <div className="alert alert-info">
              <AlertCircle
                size={19}
                aria-hidden="true"
              />

              <span>{redirectMessage}</span>
            </div>
          )}

          {error && (
            <div
              className="alert alert-error"
              role="alert"
            >
              <AlertCircle
                size={19}
                aria-hidden="true"
              />

              <span>{error}</span>
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="form-group">
              <label htmlFor="login-email">
                E-poçt ünvanı
              </label>

              <div className="input-wrapper">
                <Mail
                  size={19}
                  aria-hidden="true"
                />

                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">
                Şifrə
              </label>

              <div className="input-wrapper">
                <LockKeyhole
                  size={19}
                  aria-hidden="true"
                />

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Şifrənizi daxil edin"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current,
                    )
                  }
                  disabled={isSubmitting}
                  aria-label={
                    showPassword
                      ? "Şifrəni gizlət"
                      : "Şifrəni göstər"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="button button-primary button-large auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle
                    className="loading-spinner"
                    size={19}
                    aria-hidden="true"
                  />
                  Daxil olunur...
                </>
              ) : (
                <>
                  Daxil ol
                  <ArrowRight
                    size={19}
                    aria-hidden="true"
                  />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Hesabın yoxdur?{" "}
            <Link to="/register">
              Pulsuz qeydiyyatdan keç
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
