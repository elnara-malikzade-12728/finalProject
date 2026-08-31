import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  getCorporateInquiries,
  updateInquiryStatus,
} from "../api/corporateApi.js";
import { getApiErrorMessage } from "../api/client.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import Notification from "../components/common/Notification.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

const statusLabels = {
  NEW: "Yeni",
  CONTACTED: "Əlaqə saxlanıldı",
  CLOSED: "Bağlanıb",
};

function formatDate(date) {
  if (!date) return "—";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "—";
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${parsedDate.getFullYear()}`;
}

function AdminCorporateInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadInquiries = useCallback(
    async (signal) => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getCorporateInquiries(
          statusFilter ? { status: statusFilter } : {},
          { signal },
        );
        setInquiries(Array.isArray(response) ? response : response?.inquiries || []);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(getApiErrorMessage(requestError));
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadInquiries(controller.signal);
    return () => controller.abort();
  }, [loadInquiries]);

  async function handleStatusChange(inquiry, status) {
    setUpdatingId(inquiry.id);
    setNotification(null);

    try {
      const updated = await updateInquiryStatus(inquiry.id, status);
      setInquiries((current) =>
        current.map((item) => (item.id === inquiry.id ? { ...item, ...updated } : item)),
      );
      setNotification({ type: "success", message: "Status yeniləndi." });
    } catch (requestError) {
      setNotification({ type: "error", message: getApiErrorMessage(requestError) });
    } finally {
      setUpdatingId(null);
    }
  }

  if (isLoading) {
    return <PageLoader message="Sorğular yüklənir..." />;
  }

  if (error) {
    return (
      <ErrorState title="Sorğuları yükləmək mümkün olmadı" message={error} onRetry={() => loadInquiries()} />
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">İdarəetmə paneli</span>
          <h1>Korporativ sorğular</h1>
          <p>Şirkətlərdən gələn təlim sorğularına baxın və status yeniləyin.</p>
        </div>

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">Bütün statuslar</option>
          <option value="NEW">Yeni</option>
          <option value="CONTACTED">Əlaqə saxlanıldı</option>
          <option value="CLOSED">Bağlanıb</option>
        </select>
      </div>

      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}

      {inquiries.length === 0 ? (
        <EmptyState title="Sorğu yoxdur" message="Hələ heç bir korporativ sorğu daxil olmayıb." />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Şirkət</th>
                <th>Əlaqədar şəxs</th>
                <th>E-poçt</th>
                <th>İşçi sayı</th>
                <th>Tarix</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td>{inquiry.companyName}</td>
                  <td>{inquiry.contactName}</td>
                  <td>{inquiry.email}</td>
                  <td>{inquiry.employeeCount || "—"}</td>
                  <td>{formatDate(inquiry.createdAt)}</td>
                  <td>
                    <select
                      value={inquiry.status}
                      disabled={updatingId === inquiry.id}
                      onChange={(event) => handleStatusChange(inquiry, event.target.value)}
                    >
                      <option value="NEW">Yeni</option>
                      <option value="CONTACTED">Əlaqə saxlanıldı</option>
                      <option value="CLOSED">Bağlanıb</option>
                    </select>
                    {updatingId === inquiry.id && (
                      <RefreshCw className="loading-spinner" size={15} aria-hidden="true" />
                    )}
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

export default AdminCorporateInquiriesPage;