import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="not-found-section">
      <div className="container not-found-content">
        <span className="not-found-code">404</span>

        <Compass size={58} aria-hidden="true" />

        <h1>Səhifə tapılmadı</h1>

        <p>
          Axtardığınız səhifə mövcud deyil, silinib və ya ünvanı
          dəyişdirilib.
        </p>

        <Link to="/" className="button button-primary button-large">
          <ArrowLeft size={19} aria-hidden="true" />
          Ana səhifəyə qayıt
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;