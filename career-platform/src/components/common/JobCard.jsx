import { useState } from "react";
import {
  Banknote,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

function JobCard({ job }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="job-card">
      <div className="job-card-main">
        <div
          className="company-logo"
          aria-label={`${job.company} şirkətinin loqosu`}
        >
          {job.companyInitials}
        </div>

        <div className="job-card-content">
          <div className="job-card-heading">
            <div>
              <div className="job-tags">
                <span className="tag">{job.category}</span>

                {job.isInternship && (
                  <span className="tag tag-success">
                    Təcrübə proqramı
                  </span>
                )}
              </div>

              <h3>{job.title}</h3>

              <p className="company-name">
                <Building2 size={17} aria-hidden="true" />
                {job.company}
              </p>
            </div>

            <span className="job-posted-date">
              <CalendarDays size={16} aria-hidden="true" />
              {job.postedAt}
            </span>
          </div>

          <div className="job-meta">
            <span>
              <MapPin size={17} aria-hidden="true" />
              {job.location} · {job.workMode}
            </span>

            <span>
              <BriefcaseBusiness size={17} aria-hidden="true" />
              {job.employmentType}
            </span>

            <span>
              <Clock3 size={17} aria-hidden="true" />
              {job.experience}
            </span>

            <span>
              <Banknote size={17} aria-hidden="true" />
              {job.salary}
            </span>
          </div>

          <p className="job-description">{job.description}</p>

          <div className="job-card-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setIsExpanded((current) => !current)}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <>
                  Tələbləri gizlət
                  <ChevronUp size={18} />
                </>
              ) : (
                <>
                  Tələblərə bax
                  <ChevronDown size={18} />
                </>
              )}
            </button>

            <Link
              to={`/careers/${job.careerId}`}
              className="button button-ghost"
            >
              Uyğun yol xəritəsi
            </Link>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="job-requirements">
          <h4>Namizədə tələblər</h4>

          <ul>
            {job.requirements.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>

          <button
            type="button"
            className="button button-primary"
            onClick={() =>
              window.alert(
                "Müraciət funksiyası növbəti sprintdə backend API ilə əlavə ediləcək.",
              )
            }
          >
            Müraciət et
          </button>
        </div>
      )}
    </article>
  );
}

export default JobCard;