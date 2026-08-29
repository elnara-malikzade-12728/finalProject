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
  UserRound,
} from "lucide-react";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [acceptedTerms, setAcceptedTerms] =
    useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const {
    register,
    isAuthenticated,
    isInitializing,
  } = useAuth();

  const navigate = useNavigate();

  if (!isInitializing && isAuthenticated) {
    return <Navigate to="/courses" replace />;
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

  function validateForm() {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      return "Bütün sahələri doldurun.";
    }

    if (
      formData.name.trim().length < 2 ||
      formData.name.trim().length > 100
    ) {
      return "Ad və soyad 2–100 simvoldan ibarət olmalıdır.";
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email.trim())) {
      return "Düzgün e-poçt ünvanı daxil edin.";
    }

    if (formData.password.length < 8) {
      return "Şifrə ən azı 8 simvoldan ibarət olmalıdır.";
    }

    if (
      !/[a-z]/.test(formData.password) ||
      !/[A-Z]/.test(formData.password) ||
      !/\d/.test(formData.password)
    ) {
      return "Şifrədə böyük hərf, kiçik hərf və rəqəm olmalıdır.";
    }

    if (
      new TextEncoder().encode(formData.password)
        .length > 72
    ) {
      return "Şifrə 72 baytdan uzun olmamalıdır.";
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      return "Şifrələr uyğun gəlmir.";
    }

    if (!acceptedTerms) {
      return "İstifadə qaydalarını qəbul etməlisiniz.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (!result.success) {
        setError(
          result.message ||
            "Hesab yaratmaq mümkün olmadı.",
        );
        return;
      }

      navigate("/courses", {
        replace: true,
      });
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
            aria-label="Synex Academy ana səhifə"
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
              Synex{" "}
              <span className="brand-accent">
                Academy
              </span>
            </span>
          </Link>

          <div className="auth-heading">
            <h1>Karyera yoluna başla</h1>

            <p>
              Pulsuz hesab yarat, kurs seç və
              inkişaf addımlarını izləməyə başla.
            </p>
          </div>

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
              <label htmlFor="register-name">
                Ad və soyad
              </label>

              <div className="input-wrapper">
                <UserRound
                  size={19}
                  aria-hidden="true"
                />

                <input
                  id="register-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Adınızı və soyadınızı daxil edin"
                  autoComplete="name"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-email">
                E-poçt ünvanı
              </label>

              <div className="input-wrapper">
                <Mail
                  size={19}
                  aria-hidden="true"
                />

                <input
                  id="register-email"
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
              <label htmlFor="register-password">
                Şifrə
              </label>

              <div className="input-wrapper">
                <LockKeyhole
                  size={19}
                  aria-hidden="true"
                />

                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ən azı 8 simvol, böyük/kiçik hərf və rəqəm"
                  maxLength={72}
                  autoComplete="new-password"
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

            <div className="form-group">
              <label htmlFor="register-confirm-password">
                Şifrəni təsdiqlə
              </label>

              <div className="input-wrapper">
                <LockKeyhole
                  size={19}
                  aria-hidden="true"
                />

                <input
                  id="register-confirm-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Şifrəni yenidən daxil edin"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => {
                  setAcceptedTerms(
                    event.target.checked,
                  );

                  if (error) {
                    setError("");
                  }
                }}
                disabled={isSubmitting}
              />

              <span>
                İstifadə qaydaları və məxfilik
                şərtləri ilə razıyam.
              </span>
            </label>

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
                  Hesab yaradılır...
                </>
              ) : (
                <>
                  Hesab yarat
                  <ArrowRight
                    size={19}
                    aria-hidden="true"
                  />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Artıq hesabın var?{" "}
            <Link to="/login">
              Hesabına daxil ol
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;
