import { useCallback, useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { getAllPayments } from "../api/subscriptionsApi.js";
import { getApiErrorMessage } from "../api/client.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

const statusLabels = {
  PENDING: "Gözləmədə",
  SUCCEEDED: "Uğurlu",
  FAILED: "Uğursuz",
  REFUNDED: "Geri qaytarılıb",
};

function formatDate(date) {
  if (!date) return "—";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "—";
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${parsedDate.getFullYear()}`;
}

function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayments = useCallback(async (signal) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getAllPayments({ signal });
      setPayments(Array.isArray(response) ? response : response?.payments || []);
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
    loadPayments(controller.signal);
    return () => controller.abort();
  }, [loadPayments]);

  if (isLoading) {
    return <PageLoader message="Ödənişlər yüklənir..." />;
  }

  if (error) {
    return (
      <ErrorState title="Ödənişləri yükləmək mümkün olmadı" message={error} onRetry={() => loadPayments()} />
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">İdarəetmə paneli</span>
          <h1>Ödənişlər</h1>
          <p>Bütün istifadəçi ödənişlərinə baxın.</p>
        </div>

        <button type="button" className="admin-icon-button" onClick={() => loadPayments()} aria-label="Yenilə" title="Yenilə">
          <RefreshCcw size={17} aria-hidden="true" />
        </button>
      </div>

      {payments.length === 0 ? (
        <EmptyState title="Ödəniş yoxdur" message="Hələ heç bir ödəniş qeydə alınmayıb." />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>İstifadəçi ID</th>
                <th>Məbləğ</th>
                <th>Status</th>
                <th>Provider ID</th>
                <th>Tarix</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.userId}</td>
                  <td>{payment.amount} {payment.currency}</td>
                  <td>{statusLabels[payment.status] || payment.status}</td>
                  <td>{payment.providerReference}</td>
                  <td>{formatDate(payment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminPaymentsPage;