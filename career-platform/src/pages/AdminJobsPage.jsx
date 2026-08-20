import { useCallback, useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { deleteJob } from "../api/adminJobsApi.js";
import { getApiErrorMessage } from "../api/client.js";
import { getJobs } from "../api/jobsApi.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import Notification from "../components/common/Notification.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  const loadJobs = useCallback(async (signal) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getJobs({}, { signal });

      setJobs(Array.isArray(response) ? response : []);
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        setError(getApiErrorMessage(requestError));
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadJobs(controller.signal);

    return () => controller.abort();
  }, [loadJobs]);

  async function handleDelete(job) {
    const shouldDelete = window.confirm(
      `"${job.title}" vakansiyasını silmək istədiyinizə əminsiniz?`,
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingJobId(job.id);
    setNotification(null);

    try {
      await deleteJob(job.id);

      setJobs((currentJobs) =>
        currentJobs.filter((item) => item.id !== job.id),
      );

      setNotification({
        type: "success",
        message: "Vakansiya uğurla silindi.",
      });
    } catch (requestError) {
      setNotification({
        type: "error",
        message: getApiErrorMessage(requestError),
      });
    } finally {
      setDeletingJobId(null);
    }
  }

  if (isLoading) {
    return <PageLoader message="Vakansiyalar yüklənir..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Vakansiyaları yükləmək mümkün olmadı"
        message={error}
        onRetry={() => loadJobs()}
      />
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">
            İdarəetmə paneli
          </span>

          <h1>Vakansiyalar</h1>

          <p>
            Vakansiyaları yaradın, yeniləyin və silin.
          </p>
        </div>

        <Link
          className="button button-primary"
          to="/admin/jobs/new"
        >
          <Plus size={18} aria-hidden="true" />
          Yeni vakansiya
        </Link>
      </div>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {jobs.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="Vakansiya yoxdur"
          message="İlk vakansiyanı yaradaraq siyahını formalaşdırın."
          actionLabel="Vakansiya yarat"
          onAction={() => {
            window.location.href = "/admin/jobs/new";
          }}
        />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Vakansiya</th>
                <th>Şirkət</th>
                <th>Məkan</th>
                <th>Növ</th>
                <th className="admin-table-actions-heading">
                  Əməliyyatlar
                </th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div className="admin-job-title">
                      <BriefcaseBusiness
                        size={18}
                        aria-hidden="true"
                      />

                      <div>
                        <strong>{job.title}</strong>

                        {job.career?.title && (
                          <small>{job.career.title}</small>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>{job.company || "Qeyd edilməyib"}</td>

                  <td>{job.location || "Qeyd edilməyib"}</td>

                  <td>
                    <span className="admin-job-type">
                      {job.isInternship ||
                      job.type === "INTERNSHIP"
                        ? "Təcrübə"
                        : "İş"}
                    </span>
                  </td>

                  <td>
                    <div className="admin-table-actions">
                      <Link
                        className="admin-icon-button"
                        to={`/admin/jobs/${job.id}/edit`}
                        aria-label={`${job.title} vakansiyasını redaktə et`}
                        title="Redaktə et"
                      >
                        <Pencil size={17} aria-hidden="true" />
                      </Link>

                      <button
                        className="admin-icon-button admin-icon-button-danger"
                        type="button"
                        disabled={deletingJobId === job.id}
                        onClick={() => handleDelete(job)}
                        aria-label={`${job.title} vakansiyasını sil`}
                        title="Sil"
                      >
                        {deletingJobId === job.id ? (
                          <RefreshCw
                            className="loading-spinner"
                            size={17}
                            aria-hidden="true"
                          />
                        ) : (
                          <Trash2
                            size={17}
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminJobsPage;