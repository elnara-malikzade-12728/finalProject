import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  LoaderCircle,
  MapPin,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { applyToJob } from "../api/applicationsApi.js";
import {
  ApiError,
  getApiErrorMessage,
} from "../api/client.js";
import { getJobById } from "../api/jobsApi.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import Notification from "../components/common/Notification.jsx";
import PageLoader from "../components/common/PageLoader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const employmentLabels = { FULL_TIME: "Tam ştat", PART_TIME: "Yarım ştat", INTERNSHIP: "Təcrübə proqramı" };
const experienceLabels = { ENTRY_LEVEL: "Başlanğıc", JUNIOR: "Junior", MID_LEVEL: "Mid-level", SENIOR: "Senior" };

function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isInitializing,
    user,
  } = useAuth();

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [notification, setNotification] = useState(null);

  const loadJob = useCallback(
    async (signal) => {
      setIsLoading(true);
      setError("");
      setIsNotFound(false);

      try {
        const response = await getJobById(id, {
          signal,
        });

        setJob(response);
      } catch (requestError) {
        if (requestError.name === "AbortError") {
          return;
        }

        if (
          requestError instanceof ApiError &&
          requestError.status === 404
        ) {
          setIsNotFound(true);
          setJob(null);
          return;
        }

        setError(getApiErrorMessage(requestError));
        setJob(null);
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [id],
  );

  useEffect(() => {
    const controller = new AbortController();

    loadJob(controller.signal);

    return () => controller.abort();
  }, [loadJob]);

  async function handleApply() {
    if (
      isApplying ||
      hasApplied ||
      isInitializing ||
      user?.role === "ADMIN"
    ) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/jobs/${id}`,
          message:
            "Müraciət etmək üçün hesabınıza daxil olun.",
        },
      });
      return;
    }

    setIsApplying(true);
    setNotification(null);

    try {
      await applyToJob(id);
      setHasApplied(true);
      setNotification({
        type: "success",
        message: "Müraciətiniz uğurla göndərildi.",
      });
    } catch (requestError) {
      if (requestError.name === "AbortError") {
        return;
      }

      if (
        requestError instanceof ApiError &&
        requestError.status === 409
      ) {
        setHasApplied(true);
        setNotification({
          type: "info",
          message:
            "Bu vakansiyaya artıq müraciət etmisiniz.",
        });
        return;
      }

      if (
        requestError instanceof ApiError &&
        requestError.status === 404
      ) {
        setNotification({
          type: "error",
          message: "Vakansiya tapılmadı.",
        });
        return;
      }

      setNotification({
        type: "error",
        message: getApiErrorMessage(requestError),
      });
    } finally {
      setIsApplying(false);
    }
  }

  if (isLoading) {
    return (
      <PageLoader
        message="Vakansiya yüklənir..."
        fullPage
      />
    );
  }

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <ErrorState
            title="Vakansiyanı yükləmək mümkün olmadı"
            message={error}
            onRetry={() => loadJob()}
          />
        </div>
      </section>
    );
  }

  if (isNotFound || !job) {
    return (
      <section className="section">
        <div className="container">
          <EmptyState
            icon={BriefcaseBusiness}
            title="Vakansiya tapılmadı"
            message="Axtardığınız elan mövcud deyil və ya silinib."
            actionLabel="Vakansiyalara qayıt"
            onAction={() => navigate("/jobs")}
          />
        </div>
      </section>
    );
  }

  const companyName = job.company || "Şirkət göstərilməyib";
  const careerTitle = job.course?.title || job.career?.title;
  const careerDescription = job.course?.description || job.career?.description;
  const careerId = job.courseId || job.course?.id || job.careerId || job.career?.id;
  const applyLabel = hasApplied
    ? "Müraciət edilib"
    : isApplying
      ? "Göndərilir..."
      : "Müraciət et";
  const salary = job.salaryMin == null && job.salaryMax == null
    ? null
    : `${job.salaryMin ?? ""}${job.salaryMin != null && job.salaryMax != null ? "–" : ""}${job.salaryMax ?? ""} ${job.salaryCurrency || "AZN"}`;

  return (
    <>
      <section className="career-detail-hero">
        <div className="container">
          <Link to="/jobs" className="back-link">
            <ArrowLeft size={18} aria-hidden="true" />
            Bütün vakansiyalar
          </Link>

          <div className="career-detail-heading">
            <div>
              {careerTitle && (
                <span className="tag">{careerTitle}</span>
              )}

              <h1>{job.title}</h1>

              <p className="company-name">
                <Building2 size={17} aria-hidden="true" />
                {companyName}
              </p>
            </div>

            {user?.role === "ADMIN" ? (
              <span className="tag">
                Administrator müraciət edə bilməz
              </span>
            ) : (
              <button
                type="button"
                className="button button-primary button-large"
                onClick={handleApply}
                disabled={isApplying || hasApplied}
              >
                {isApplying ? (
                  <>
                    <LoaderCircle
                      className="loading-spinner"
                      size={19}
                      aria-hidden="true"
                    />
                    {applyLabel}
                  </>
                ) : (
                  applyLabel
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {notification && (
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          )}

          <div className="career-overview">
            <div className="career-overview-item">
              <BriefcaseBusiness size={22} aria-hidden="true" />
              <div><span>İş növü</span><strong>{employmentLabels[job.employmentType] || "Tam ştat"}</strong></div>
            </div>

            {job.experienceLevel && (
              <div className="career-overview-item">
                <BriefcaseBusiness size={22} aria-hidden="true" />
                <div><span>Təcrübə</span><strong>{experienceLabels[job.experienceLevel]}</strong></div>
              </div>
            )}

            {salary && (
              <div className="career-overview-item">
                <BriefcaseBusiness size={22} aria-hidden="true" />
                <div><span>Maaş</span><strong>{salary}</strong></div>
              </div>
            )}

            {job.location && (
              <div className="career-overview-item">
                <MapPin size={22} aria-hidden="true" />
                <div>
                  <span>Məkan</span>
                  <strong>{job.location}</strong>
                </div>
              </div>
            )}

            {careerTitle && (
              <div className="career-overview-item">
                <BriefcaseBusiness size={22} aria-hidden="true" />
                <div>
                  <span>Kurs istiqaməti</span>
                  <strong>{careerTitle}</strong>
                </div>
              </div>
            )}
          </div>

          {job.description && (
            <div className="content-card">
              <div className="content-card-heading">
                <BriefcaseBusiness size={25} aria-hidden="true" />
                <div>
                  <h2>Vakansiya haqqında</h2>
                  <p>Elan təsviri və iş barədə əsas məlumat.</p>
                </div>
              </div>

              <p className="job-description">{job.description}</p>
            </div>
          )}

          {(careerTitle || careerDescription) && (
            <div className="content-card">
              <div className="content-card-heading">
                <Building2 size={25} aria-hidden="true" />
                <div>
                  <h2>Kurs məlumatı</h2>
                  <p>Bu vakansiyanın bağlı olduğu karyera istiqaməti.</p>
                </div>
              </div>

              {careerTitle && <p>{careerTitle}</p>}
              {careerDescription && <p>{careerDescription}</p>}
            </div>
          )}

          {job.url && (
            <p>
              <a
                href={job.url}
                className="button button-secondary"
                target="_blank"
                rel="noreferrer"
              >
                Elan keçidi
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </p>
          )}

          <div className="job-card-actions">
            {careerId && (
              <Link
                to={job.courseId || job.course?.id ? `/courses/${careerId}` : `/careers/${careerId}`}
                className="button button-ghost"
              >
                Uyğun yol xəritəsi
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default JobDetailsPage;
