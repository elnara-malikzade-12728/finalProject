import { useCallback, useEffect, useState } from "react";
import { CalendarClock, ShieldCheck, ShieldOff } from "lucide-react";
import { Link } from "react-router-dom";
import {
  cancelMySubscription,
  getMySubscription,
} from "../api/subscriptionsApi.js";
import { getApiErrorMessage } from "../api/client.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import Notification from "../components/common/Notification.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

const STATUS_LABELS = {
  PENDING: "Gözləmədə",
  ACTIVE: "Aktiv",
  CANCELLED: "Ləğv edilib",
  EXPIRED: "Bitib",
  PAYMENT_FAILED: "Ödəniş uğursuz oldu",
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadSubscription = useCallback(async (signal) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getMySubscription({ signal });
      setSubscription(response);
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
    loadSubscription(controller.signal);
    return () => controller.abort();
  }, [loadSubscription]);

  async function handleCancel() {
    setIsCancelling(true);
    setShowConfirm(false);

    try {
      const updated = await cancelMySubscription();
      setSubscription(updated);
      setNotification({
        type: "success",
        message: "Abunəlik ləğv edildi. Ödənilmiş müddət bitənə qədər girişiniz davam edəcək.",
      });
    } catch (requestError) {
      setNotification({
        type: "error",
        message: getApiErrorMessage(requestError),
      });
    } finally {
      setIsCancelling(false);
    }
  }

  if (isLoading) {
    return <PageLoader message="Abunəlik məlumatı yüklənir..." fullPage />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => loadSubscription()} />;
  }

  if (!subscription) {
    return (
      <EmptyState
        title="Aktiv abunəlik yoxdur"
        message="Hazırda Pro planına abunə deyilsiniz. Premium kurslara giriş üçün plan seçin."
        actionLabel="Planlara bax"
        onAction={() => {
          window.location.href = "/pricing";
        }}
      />
    );
  }

  const isActive = subscription.status === "ACTIVE";
  const isCancelled = Boolean(subscription.cancelledAt);

  return (
    <section className="subscription-page">
      <h1>Abunəliyim</h1>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <article className="subscription-card">
        <div className="subscription-card-header">
          <h2>{subscription.plan?.name || "Plan"}</h2>
          <span
            className={`subscription-status subscription-status-${subscription.status.toLowerCase()}`}
          >
            {isActive ? (
              <ShieldCheck size={16} aria-hidden="true" />
            ) : (
              <ShieldOff size={16} aria-hidden="true" />
            )}
            {STATUS_LABELS[subscription.status] || subscription.status}
          </span>
        </div>

        <dl className="subscription-details">
          <div>
            <dt>Başlama tarixi</dt>
            <dd>{formatDate(subscription.startedAt)}</dd>
          </div>
          <div>
            <dt>Bitmə tarixi</dt>
            <dd>
              <CalendarClock size={14} aria-hidden="true" />{" "}
              {formatDate(subscription.expiresAt)}
            </dd>
          </div>
        </dl>

        {isCancelled && (
          <p className="subscription-cancelled-note">
            Abunəlik ləğv edilib, {formatDate(subscription.expiresAt)} tarixinə
            qədər aktiv qalacaq.
          </p>
        )}

        <div className="subscription-actions">
          {isActive && !isCancelled && (
            <button
              type="button"
              className="button button-danger"
              onClick={() => setShowConfirm(true)}
              disabled={isCancelling}
            >
              Abunəliyi ləğv et
            </button>
          )}

          <Link to="/payment-history" className="button button-secondary">
            Ödəniş tarixçəsi
          </Link>

          <Link to="/pricing" className="button button-primary">
            Planı dəyiş
          </Link>
        </div>
      </article>

      {showConfirm && (
        <div className="confirm-dialog-overlay" role="dialog" aria-modal="true">
          <div className="confirm-dialog">
            <h3>Abunəliyi ləğv etmək istəyirsiniz?</h3>
            <p>
              Ləğv etsəniz, {formatDate(subscription.expiresAt)} tarixinə qədər
              girişiniz davam edəcək, sonra avtomatik dayanacaq.
            </p>
            <div className="confirm-dialog-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowConfirm(false)}
              >
                İmtina et
              </button>
              <button
                type="button"
                className="button button-danger"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? "Ləğv edilir..." : "Bəli, ləğv et"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default SubscriptionPage;
