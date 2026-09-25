import {
  ArrowRight,
  ChartNoAxesCombined,
  Clock3,
  Code2,
  Megaphone,
  Palette,
  Signal,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const careerIcons = {
  Code2,
  ChartNoAxesCombined,
  Megaphone,
  Palette,
  Zap,
};

function CareerCard({ career }) {
  const CareerIcon = careerIcons[career.icon] || Code2;

  return (
    <article className="career-card">
      <div className="career-card-header">
        <span className="career-icon" aria-hidden="true">
          <CareerIcon size={26} />
        </span>

        <span className="tag">{career.category?.name || career.category || "Kateqoriyasız"}</span>
      </div>

      <div className="career-card-content">
        <h3>{career.title}</h3>
        <p>{career.description || career.shortDescription || "Kurs haqqında məlumat tezliklə əlavə ediləcək."}</p>
      </div>

      <div className="career-card-meta">
        <span>
          <Clock3 size={16} aria-hidden="true" />
          {career.moduleCount ?? 0} modul
        </span>

        <span>
          <Signal size={16} aria-hidden="true" />
          {career.lessonCount ?? 0} dərs
        </span>
      </div>

      <Link
        to={`/courses/${career.id}`}
        className="career-card-link"
        aria-label={`${career.title} haqqında ətraflı bax`}
      >
        Ətraflı bax
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </article>
  );
}

export default CareerCard;
