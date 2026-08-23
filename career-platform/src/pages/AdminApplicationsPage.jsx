import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  FileText,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import {
  deleteApplication,
  getAdminApplications,
  updateApplicationStatus,
} from "../api/adminApplicationsApi.js";
import { getApiErrorMessage } from "../api/client.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import Notification from "../components/common/Notification.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

const applicationStatuses = [
  {
    value: "PENDING",
    label: "Gözləyir",
  },
  {
    value: "REVIEWED",
    label: "Yoxlanılır",
  },
  {
    value: "ACCEPTED",
    label: "Qəbul edildi",
  },
  {
    value: "REJECTED",
    label: "Rədd edildi",
  },
];

function getStatusLabel(status) {
  return (
    applicationStatuses.find(
      (item) => item.value === status,
    )?.label || status
  );
}

function formatDate(date) {
  if (!date) {
    return "Tarix yoxdur";
  }

  return new Intl.DateTimeFormat("az-AZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notification, setNotification] =
    useState(null);

  const loadApplications = useCallback(
    async (signal) => {
      setIsLoading(true);
      setError("");

      try {
        const response =
          await getAdminApplications(
            {
              search,
              status: statusFilter,
            },
            { signal },
          );

        const applicationList = Array.isArray(response)
          ? response
          : response?.applications || [];

        setApplications(applicationList);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(
            getApiErrorMessage(requestError),
          );
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [search, statusFilter],
  );

  useEffect(() => {
    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      loadApplications(controller.signal);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [loadApplications]);

  async function handleStatusChange(
    application,
    status,
  ) {
    const previousStatus = application.status;

    setUpdatingId(application.id);
    setNotification(null);

    setApplications((currentApplications) =>
      currentApplications.map((item) =>
        item.id === application.id
          ? {
              ...item,
              status,
            }
          : item,
      ),
    );

    try {
      const updatedApplication =
        await updateApplicationStatus(
          application.id,
          status,
        );

      if (updatedApplication) {
        setApplications((currentApplications) =>
          currentApplications.map((item) =>
            item.id === application.id
              ? {
                  ...item,
                  ...updatedApplication,
                }
              : item,
          ),
        );
      }

      setNotification({
        type: "success",
        message: `Müraciətin statusu “${getStatusLabel(
          status,
        )}” olaraq yeniləndi.`,
      });
    } catch (requestError) {
      setApplications((currentApplications) =>
        currentApplications.map((item) =>
          item.id === application.id
            ? {
                ...item,
                status: previousStatus,
              }
            : item,
        ),
      );

      setNotification({
        type: "error",
        message:
          getApiErrorMessage(requestError),
      });
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(application) {
    const applicantName =
      application.user?.name ||
      application.applicantName ||
      "Bu istifadəçinin";

    const shouldDelete = window.confirm(
      `${applicantName} müraciətini silmək istədiyinizə əminsiniz?`,
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingId(application.id);
    setNotification(null);

    try {
      await deleteApplication(application.id);

      setApplications((currentApplications) =>
        currentApplications.filter(
          (item) => item.id !== application.id,
        ),
      );

      setNotification({
        type: "success",
        message: "Müraciət uğurla silindi.",
      });
    } catch (requestError) {
      setNotification({
        type: "error",
        message:
          getApiErrorMessage(requestError),
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">
            İdarəetmə paneli
          </span>

          <h1>Müraciətlər</h1>

          <p>
            Vakansiyalara göndərilmiş müraciətləri
            yoxlayın və statuslarını idarə edin.
          </p>
        </div>
      </div>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="admin-filters">
        <label className="admin-search">
          <Search size={18} aria-hidden="true" />

          <span className="sr-only">
            Müraciətlərdə axtarış
          </span>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Namizəd, e-poçt və ya vakansiya axtar..."
          />
        </label>

        <label className="admin-status-filter">
          <span>Status</span>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="ALL">
              Bütün statuslar
            </option>

            {applicationStatuses.map((status) => (
              <option
                key={status.value}
                value={status.value}
              >
                {status.label}
              </option>
            ))}
          </select>
        </label>
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
          title="Müraciət tapılmadı"
          message="Seçilmiş axtarış və status meyarlarına uyğun müraciət yoxdur."
        />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table admin-applications-table">
            <thead>
              <tr>
                <th>Namizəd</th>
                <th>Vakansiya</th>
                <th>Tarix</th>
                <th>Status</th>
                <th className="admin-table-actions-heading">
                  Əməliyyatlar
                </th>
              </tr>
            </thead>

            <tbody>
              {applications.map((application) => {
                const applicantName =
                  application.user?.name ||
                  application.applicantName ||
                  "Adsız namizəd";

                const applicantEmail =
                  application.user?.email ||
                  application.email ||
                  "E-poçt yoxdur";

                const jobTitle =
                  application.job?.title ||
                  application.jobTitle ||
                  "Vakansiya yoxdur";

                const company =
                  application.job?.company ||
                  application.company;

                return (
                  <tr key={application.id}>
                    <td>
                      <div className="admin-applicant">
                        <span className="admin-applicant-avatar">
                          {applicantName
                            .charAt(0)
                            .toLocaleUpperCase("az")}
                        </span>

                        <div>
                          <strong>{applicantName}</strong>
                          <small>{applicantEmail}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="admin-application-job">
                        <strong>{jobTitle}</strong>

                        {company && (
                          <small>{company}</small>
                        )}
                      </div>
                    </td>

                    <td>
                      {formatDate(
                        application.createdAt,
                      )}
                    </td>

                    <td>
                      <select
                        className={`admin-application-status admin-application-status-${(
                          application.status ||
                          "PENDING"
                        ).toLowerCase()}`}
                        value={
                          application.status ||
                          "PENDING"
                        }
                        disabled={
                          updatingId === application.id
                        }
                        onChange={(event) =>
                          handleStatusChange(
                            application,
                            event.target.value,
                          )
                        }
                        aria-label={`${applicantName} müraciətinin statusu`}
                      >
                        {applicationStatuses.map(
                          (status) => (
                            <option
                              key={status.value}
                              value={status.value}
                            >
                              {status.label}
                            </option>
                          ),
                        )}
                      </select>
                    </td>

                    <td>
                      <div className="admin-table-actions">
                        <button
                          className="admin-icon-button admin-icon-button-danger"
                          type="button"
                          disabled={
                            deletingId === application.id
                          }
                          onClick={() =>
                            handleDelete(application)
                          }
                          aria-label={`${applicantName} müraciətini sil`}
                          title="Sil"
                        >
                          {deletingId ===
                          application.id ? (
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminApplicationsPage;
