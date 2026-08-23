import {
  BriefcaseBusiness,
  Building2,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

function getCompanyInitials(company) {
  if (!company) {
    return "—";
  }

  const initials = company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return initials || "—";
}

function JobCard({ job }) {
  const companyName = job.company || "Şirkət göstərilməyib";
  const careerTitle = job.career?.title;
  const careerId = job.careerId || job.career?.id;

  return (
    <article className="job-card">
      <div className="job-card-main">
        <div
          className="company-logo"
          aria-label={`${companyName} şirkətinin loqosu`}
        >
          {getCompanyInitials(job.company)}
        </div>

        <div className="job-card-content">
          <div className="job-card-heading">
            <div>
              {careerTitle && (
                <div className="job-tags">
                  <span className="tag">{careerTitle}</span>
                </div>
              )}

              <h3>
                <Link to={`/jobs/${job.id}`}>{job.title}</Link>
              </h3>

              <p className="company-name">
                <Building2 size={17} aria-hidden="true" />
                {companyName}
              </p>
            </div>
          </div>

          <div className="job-meta">
            {job.location && (
              <span>
                <MapPin size={17} aria-hidden="true" />
                {job.location}
              </span>
            )}

            {careerTitle && (
              <span>
                <BriefcaseBusiness size={17} aria-hidden="true" />
                {careerTitle}
              </span>
            )}
          </div>

          {job.description && (
            <p className="job-description">{job.description}</p>
          )}

          <div className="job-card-actions">
            <Link
              to={`/jobs/${job.id}`}
              className="button button-secondary"
            >
              Ətraflı bax
            </Link>

            {careerId && (
              <Link
                to={`/careers/${careerId}`}
                className="button button-ghost"
              >
                Uyğun yol xəritəsi
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default JobCard;
