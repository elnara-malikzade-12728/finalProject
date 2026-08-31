import { useCallback, useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { getAllSubscriptions } from "../api/subscriptionsApi.js";
import { getApiErrorMessage } from "../api/client.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

const statusLabels = {
  PENDING: "Gözləmədə",
  ACTIVE: "Aktiv",
  CANCELLED: "Ləğv edilib",
  EXPIRED: "Bitib",
  PAYMENT_FAILED: "Ödəniş uğursuz oldu",
};

function formatDate(date) {
  if (!date) return "—";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "—";
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${parsedDate.getFullYear()}`;
}

function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubscriptions = useCallback(async (signal) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getAllSubscriptions({ signal });
      setSubscriptions(Array.isArray(response) ? response : response?.subscriptions || []);
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
    loadSubscriptions(controller.signal);
    return () => controller.abort();
  }, [loadSubscriptions]);

  if (isLoading) {
    return <PageLoader message="Abunəliklər yüklənir..." />;
  }

  if (error) {
    return (
      <ErrorState title="Abunəlikləri yükləmək mümkün olmadı" message={error} onRetry={() => loadSubscriptions()} />
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">İdarəetmə paneli</span>
          <h1>Abunəliklər</h1>
          <p>Bütün istifadəçi abunəliklərinə baxın.</p>
        </div>

        <button type="button" className="admin-icon-button" onClick={() => loadSubscriptions()} aria-label="Yenilə" title="Yenilə">
          <RefreshCcw size={17} aria-hidden="true" />
        </button>
      </div>

      {subscriptions.length === 0 ? (
        <EmptyState title="Abunəlik yoxdur" message="Hələ heç bir abunəlik qeydə alınmayıb." />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>İstifadəçi ID</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Başlama</th>
                <th>Bitmə</th>
              </tr>
            </thead>

            <tbody>
              {subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td>{subscription.userId}</td>
                  <td>{subscription.plan?.name || subscription.planId}</td>
                  <td>{statusLabels[subscription.status] || subscription.status}</td>
                  <td>{formatDate(subscription.startedAt)}</td>
                  <td>{formatDate(subscription.expiresAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminSubscriptionsPage;