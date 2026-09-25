import { useCallback, useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  FileText,
  MapPin,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getMyApplications, withdrawApplication } from "../api/applicationsApi.js";
import { getApiErrorMessage } from "../api/client.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";
import Notification from "../components/common/Notification.jsx";

const statusLabels = {
  PENDING: "Gözləmədə",
  REVIEWED: "Nəzərdən keçirildi",
  ACCEPTED: "Qəbul edildi",
  REJECTED: "Rədd edildi",
};

function getStatusLabel(status) {
  return statusLabels[status] || status || "Naməlum";
}

function formatApplicationDate(date) {
  if (!date) {
    return "Tarix yoxdur";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Tarix yoxdur";
  }

  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(
    2,
    "0",
  );
  const year = parsedDate.getFullYear();

  return `${day}.${month}.${year}`;
}

function MyApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [notification, setNotification] = useState(null);

  async function handleWithdraw(application) {
    if (!window.confirm("Müraciəti geri götürmək istədiyinizə əminsiniz?")) return;
    setWithdrawingId(application.id);
    setNotification(null);
    try {
      await withdrawApplication(application.id);
      setApplications((current) => current.filter((item) => item.id !== application.id));
      setNotification({ type: "success", message: "Müraciət geri götürüldü." });
    } catch (requestError) {
      setNotification({ type: "error", message: getApiErrorMessage(requestError) });
    } finally {
      setWithdrawingId(null);
    }
  }

  const loadApplications = useCallback(async (signal) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getMyApplications({
        signal,
      });

      const applicationList = Array.isArray(response)
        ? response
        : response?.applications || [];

      setApplications(applicationList);
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        setError(getApiErrorMessage(requestError));
        setApplications([]);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadApplications(controller.signal);

    return () => controller.abort();
  }, [loadApplications]);

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-content">
          <span className="eyebrow">
            <FileText size={17} aria-hidden="true" />
            Şəxsi kabinet
          </span>

          <h1>Müraciətlərim</h1>

          <p>
            Göndərdiyiniz vakansiya müraciətlərinin statusunu
            buradan izləyin.
          </p>
        </div>
      </section>

      <section className="section jobs-section">
        <div className="container">
          {notification && <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}
          <div className="results-heading">
            <div>
              <h2>Göndərilmiş müraciətlər</h2>
              <p>
                {isLoading
                  ? "Müraciətlər yüklənir..."
                  : `${applications.length} müraciət`}
              </p>
            </div>
          </div>

          {isLoading ? (
            <PageLoader message="Müraciətlər yüklənir..." />
          ) : error ? (
            <ErrorState
              title="Müraciətləri yükləmək mümkün olmadı"
              message={error}
              onRetry={() => loadApplications()}
            />
          ) : applications.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Müraciət yoxdur"
              message="Hələ heç bir vakansiyaya müraciət etməmisiniz."
              actionLabel="Vakansiyalara bax"
              onAction={() => navigate("/jobs")}
            />
          ) : (
            <div className="jobs-list">
              {applications.map((application) => {
                const job = application.job || {};
                const jobId = job.id || application.jobId;
                const title =
                  job.title ||
                  application.jobTitle ||
                  "Vakansiya";
                const company =
                  job.company ||
                  application.company ||
                  "Şirkət göstərilməyib";
                const location =
                  job.location || application.location;

                return (
                  <article
                    key={application.id}
                    className="job-card"
                  >
                    <div className="job-card-main">
                      <div className="job-card-content">
                        <div className="job-card-heading">
                          <div>
                            <div className="job-tags">
                              <span className="tag">
                                {getStatusLabel(
                                  application.status,
                                )}
                              </span>
                            </div>

                            <h3>
                              {jobId ? (
                                <Link to={`/jobs/${jobId}`}>
                                  {title}
                                </Link>
                              ) : (
                                title
                              )}
                            </h3>

                            <p className="company-name">
                              <Building2
                                size={17}
                                aria-hidden="true"
                              />
                              {company}
                            </p>
                          </div>
                        </div>

                        <div className="job-meta">
                          {location && (
                            <span>
                              <MapPin
                                size={17}
                                aria-hidden="true"
                              />
                              {location}
                            </span>
                          )}

                          <span>
                            <CalendarDays
                              size={16}
                              aria-hidden="true"
                            />
                            {formatApplicationDate(
                              application.createdAt,
                            )}
                          </span>

                          <span>
                            <BriefcaseBusiness
                              size={17}
                              aria-hidden="true"
                            />
                            {getStatusLabel(application.status)}
                          </span>
                        </div>

                        {application.status === "PENDING" && (
                          <div className="job-card-actions">
                            <button className="button button-ghost" type="button" disabled={withdrawingId === application.id} onClick={() => handleWithdraw(application)}>
                              <Trash2 size={17} aria-hidden="true" />
                              {withdrawingId === application.id ? "Geri götürülür..." : "Müraciəti geri götür"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default MyApplicationsPage;
